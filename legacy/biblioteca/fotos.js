// Operações da biblioteca de fotografias. Tudo passa por `repo` (js/storage/).
import { repo } from '../storage/index.js';
import { ErroArmazenamento } from '../storage/erros.js';
import { criarObservavel } from '../core/observavel.js';
import { CATEGORIAS } from '../config.js';
import { gerarDerivados } from '../import/derivados.js';

// Avisa a interface de que a lista de fotografias mudou (importação, exclusão).
export const bibliotecaMudou = criarObservavel({ revisao: 0 });
export const avisarMudanca = () => bibliotecaMudou.definir({ revisao: bibliotecaMudou.obter().revisao + 1 });

const IDS_CATEGORIAS = new Set(CATEGORIAS.map((c) => c.id));
export const rotuloCategoria = (id) => CATEGORIAS.find((c) => c.id === id)?.rotulo ?? id;

// Exclusão recusada porque projetos usam a fotografia. Estende ErroArmazenamento para atravessar
// a transação sem ser convertida em erro genérico.
export class ExclusaoBloqueada extends ErroArmazenamento {
  constructor(projetos) {
    super('EXCLUSAO_BLOQUEADA', { detalhe: `${projetos.length} projeto(s)` });
    this.projetos = projetos; // [{ id, nome, situacao }]
  }
}

export async function listarFotos() {
  const lista = await repo.listar('fotos');
  return lista.sort((a, b) => (b.dataImportacao - a.dataImportacao) || a.nomeOriginal.localeCompare(b.nomeOriginal, 'pt-BR'));
}

// Só os campos organizacionais podem mudar; o original e os dados técnicos nunca são tocados.
export async function atualizarFoto(id, { categorias, favorita, tratada } = {}) {
  const mudancas = {};
  if (categorias !== undefined) {
    if (!Array.isArray(categorias) || categorias.some((c) => !IDS_CATEGORIAS.has(c))) {
      throw new ErroArmazenamento('DADO_INVALIDO', { detalhe: 'categoria desconhecida' });
    }
    mudancas.categorias = [...new Set(categorias)];
  }
  if (favorita !== undefined) mudancas.favorita = !!favorita;
  if (tratada !== undefined) mudancas.tratada = !!tratada;
  return repo.atualizar('fotos', id, mudancas);
}

async function primeiro(store, indice, valor) {
  const [r] = await repo.listar(store, { indice, valor, limite: 1 });
  return r ?? null;
}

export async function obterDerivado(fotoId, tipo) {
  return (await primeiro('derivados', 'fotoId_tipo', [fotoId, tipo]))?.blob ?? null;
}
export async function obterOriginal(fotoId) {
  return (await primeiro('originais', 'fotoId', fotoId))?.blob ?? null;
}

const resumoProjeto = (p) => ({ id: p.id, nome: p.nome || 'Projeto sem nome', situacao: p.situacao });
export async function projetosQueUsam(fotoId) {
  return (await repo.listar('projetos', { indice: 'fotoIds', valor: fotoId })).map(resumoProjeto);
}

// Exclusão em UMA transação: confere projetos, apaga derivados, original e registro.
// Projetos arquivados e na lixeira também protegem a fotografia (Especificação §5.7, §12.9).
export async function excluirFoto(fotoId) {
  await repo.transacao(['fotos', 'originais', 'derivados', 'projetos'], 'readwrite', async (op) => {
    const usos = await op.listar('projetos', { indice: 'fotoIds', valor: fotoId });
    if (usos.length) throw new ExclusaoBloqueada(usos.map(resumoProjeto));
    for (const d of await op.listar('derivados', { indice: 'fotoId', valor: fotoId })) await op.excluir('derivados', d.id);
    for (const o of await op.listar('originais', { indice: 'fotoId', valor: fotoId })) await op.excluir('originais', o.id);
    if (!(await op.excluir('fotos', fotoId))) throw new ErroArmazenamento('NAO_ENCONTRADO', { detalhe: `fotos/${fotoId}` });
  });
  avisarMudanca();
}

// Recria miniatura e cópia de trabalho a partir do original (que não é alterado).
export async function regenerarDerivados(fotoId) {
  const original = await obterOriginal(fotoId);
  if (!original) throw new ErroArmazenamento('NAO_ENCONTRADO', { detalhe: `original de ${fotoId}` });
  const g = await gerarDerivados(original);
  await repo.transacao('derivados', 'readwrite', async (op) => {
    for (const tipo of ['miniatura', 'trabalho']) {
      const d = g[tipo];
      const campos = { blob: d.blob, largura: d.largura, altura: d.altura, formato: d.formato };
      const [atual] = await op.listar('derivados', { indice: 'fotoId_tipo', valor: [fotoId, tipo], limite: 1 });
      if (atual) await op.atualizar('derivados', atual.id, campos);
      else await op.inserir('derivados', { fotoId, tipo, ...campos });
    }
  });
}
