// Importação em fila: um arquivo por vez (hash incremental, decodificação única, gravação atômica).
// O original é guardado como Blob, sem conversão. Nada é enviado a servidores.
import { repo } from '../storage/index.js';
import { ErroArmazenamento, traduzir } from '../storage/erros.js';
import { lerEstimativa, avaliarEspaco } from '../storage/persistencia.js';
import { atualizarSituacao } from '../storage/estado.js';
import { criarObservavel } from '../core/observavel.js';
import { IMPORTACAO } from '../config.js';
import { formatarBytes } from '../core/formatar.js';
import { sha256Blob } from './hash.js';
import { detectarFormato, lerOrientacaoExif, ErroImagem } from './formato.js';
import { gerarDerivados } from './derivados.js';
import { avisarMudanca } from '../biblioteca/fotos.js';

const inicial = () => ({
  ativa: false, concluida: false,
  total: 0, indice: 0, atual: '',
  importadas: 0, duplicadas: [], recusadas: [], // listas de { nome, motivo }
  naoProcessadas: 0, interrompida: null,        // texto, quando a fila parou antes do fim
});
export const estadoImportacao = criarObservavel(inicial());
export const limparResultadoImportacao = () => { if (!estadoImportacao.obter().ativa) estadoImportacao.definir(inicial()); };

const cederVez = () => new Promise((r) => setTimeout(r, 0));
const avisarSaida = (e) => { e.preventDefault(); e.returnValue = ''; };

class Interrompe extends Error {} // para a fila inteira (espaço esgotado, banco com problema)

async function conferirEspaco() {
  const av = avaliarEspaco(await lerEstimativa());
  if (av.bloqueiaImportacao) {
    throw new Interrompe('O espaço do navegador está quase esgotado (mais de 95% em uso). Libere espaço no computador antes de importar mais fotografias.');
  }
}

// Processa um arquivo. Devolve 'importada' | { duplicada } | lança ErroImagem (recusa só deste arquivo).
async function processar(arquivo) {
  if (arquivo.size > IMPORTACAO.maxArquivoBytes) {
    throw new ErroImagem(`O arquivo tem ${formatarBytes(arquivo.size)}; o limite é ${formatarBytes(IMPORTACAO.maxArquivoBytes)}.`);
  }
  const { formato, mime } = await detectarFormato(arquivo);
  const hash = await sha256Blob(arquivo);

  const [existente] = await repo.listar('fotos', { indice: 'hash', valor: hash, limite: 1 });
  if (existente) return { duplicada: `igual a "${existente.nomeOriginal}", já na biblioteca` };

  const orientacao = formato === 'jpeg' ? await lerOrientacaoExif(arquivo) : 1;
  const g = await gerarDerivados(arquivo); // valida a integridade: falha se não decodifica
  await conferirEspaco();

  const original = arquivo.slice(0, arquivo.size, mime); // Blob sem copiar dados
  const fotoId = crypto.randomUUID();
  try {
    await repo.transacao(['fotos', 'originais', 'derivados'], 'readwrite', async (op) => {
      await op.inserir('fotos', {
        id: fotoId,
        nomeOriginal: arquivo.name,
        formato, mime,
        tamanhoBytes: arquivo.size,
        largura: g.largura, altura: g.altura,
        orientacao,
        arquivoModificadoEm: arquivo.lastModified || null,
        hash,
        categorias: [], favorita: false, tratada: false,
        pontoFocal: { x: 0.5, y: 0.5 }, observacoes: '', areasProtegidas: [],
        dataImportacao: Date.now(),
      });
      await op.inserir('originais', { fotoId, blob: original });
      for (const tipo of ['miniatura', 'trabalho']) {
        const d = g[tipo];
        await op.inserir('derivados', { fotoId, tipo, blob: d.blob, largura: d.largura, altura: d.altura, formato: d.formato });
      }
    });
  } catch (e) {
    const erro = traduzir(e);
    if (erro.codigo === 'DUPLICADO') return { duplicada: 'já existe na biblioteca' }; // importação simultânea em outra aba
    throw erro;
  }
  return 'importada';
}

export async function importarArquivos(lista) {
  const arquivos = [...lista];
  if (!arquivos.length || estadoImportacao.obter().ativa) return;
  estadoImportacao.definir({ ...inicial(), ativa: true, total: arquivos.length });
  window.addEventListener('beforeunload', avisarSaida);
  let feitas = 0;
  try {
    await conferirEspaco();
    for (const arquivo of arquivos) {
      estadoImportacao.definir({ indice: feitas + 1, atual: arquivo.name });
      await cederVez();
      const s = estadoImportacao.obter();
      try {
        const r = await processar(arquivo);
        if (r === 'importada') estadoImportacao.definir({ importadas: s.importadas + 1 });
        else estadoImportacao.definir({ duplicadas: [...s.duplicadas, { nome: arquivo.name, motivo: r.duplicada }] });
      } catch (e) {
        if (e instanceof ErroImagem) {
          estadoImportacao.definir({ recusadas: [...s.recusadas, { nome: arquivo.name, motivo: e.message }] });
        } else throw e;
      }
      feitas++;
    }
  } catch (e) {
    const texto = e instanceof Interrompe ? e.message
      : e instanceof ErroArmazenamento ? e.mensagemUsuario
      : traduzir(e).mensagemUsuario;
    if (!(e instanceof Interrompe)) console.error('Importação interrompida:', e);
    estadoImportacao.definir({ interrompida: texto, naoProcessadas: arquivos.length - feitas });
  } finally {
    window.removeEventListener('beforeunload', avisarSaida);
    estadoImportacao.definir({ ativa: false, concluida: true, atual: '' });
    avisarMudanca();
    atualizarSituacao();
  }
}
