// Estado do armazenamento para a interface: inicialização, persistência, espaço e contagens.
import { criarObservavel } from '../core/observavel.js';
import { banco, repo } from './index.js';
import { DB_VERSAO } from './esquema.js';
import { MENSAGENS, traduzir } from './erros.js';
import { novoId } from './uuid.js';
import { lerPersistencia, solicitarPersistencia, lerEstimativa, avaliarEspaco } from './persistencia.js';

export const estadoArmazenamento = criarObservavel({
  fase: 'iniciando', // iniciando | pronto | erro
  codigoErro: null,
  mensagemErro: null,
  bloqueado: false,
  versaoBanco: null,
  primeiraVez: false,
  persistencia: null,
  espaco: null,
  avaliacaoEspaco: null,
  contagens: null,
});

let promessa = null;
export const iniciarArmazenamento = () => (promessa ??= executar());

async function executar() {
  banco.assinar((evento) => {
    if (evento.tipo === 'bloqueado') estadoArmazenamento.definir({ bloqueado: true });
    if (evento.tipo === 'versao-alterada') {
      estadoArmazenamento.definir({ fase: 'erro', codigoErro: 'VERSAO_ALTERADA', mensagemErro: MENSAGENS.VERSAO_ALTERADA });
    }
  });
  try {
    await banco.abrir();
    const primeiraVez = await registrarInstalacao();
    estadoArmazenamento.definir({ fase: 'pronto', bloqueado: false, versaoBanco: banco.versao, primeiraVez });
    await atualizarSituacao({ solicitar: true });
  } catch (e) {
    const erro = traduzir(e);
    console.error('Armazenamento:', erro.codigo, erro.causa ?? erro);
    estadoArmazenamento.definir({ fase: 'erro', bloqueado: false, codigoErro: erro.codigo, mensagemErro: erro.mensagemUsuario });
  }
}

// Registro "instalacao": identifica este banco e a versão da estrutura (útil no futuro backup).
async function registrarInstalacao() {
  return repo.transacao('config', 'readwrite', async (op) => {
    const atual = await op.obter('config', 'instalacao');
    if (!atual) {
      await op.inserir('config', { chave: 'instalacao', instalacaoId: novoId(), versaoBanco: DB_VERSAO });
      return true;
    }
    if (atual.versaoBanco !== DB_VERSAO) await op.atualizar('config', 'instalacao', { versaoBanco: DB_VERSAO });
    return false;
  });
}

// Relê persistência, espaço e contagens. Com { solicitar: true}, pede persistência ao navegador.
export async function atualizarSituacao({ solicitar = false } = {}) {
  if (estadoArmazenamento.obter().fase !== 'pronto') return;
  const persistencia = solicitar ? await solicitarPersistencia() : await lerPersistencia();
  const espaco = await lerEstimativa();
  let contagens = null;
  try {
    contagens = {
      fotos: await repo.contar('fotos'),
      projetos: await repo.contar('projetos'),
    };
  } catch (e) { console.error('Contagem falhou:', e); }
  estadoArmazenamento.definir({ persistencia, espaco, avaliacaoEspaco: avaliarEspaco(espaco), contagens });
}
