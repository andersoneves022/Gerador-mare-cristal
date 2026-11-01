// Projetos no IndexedDB (store "projetos", já existente). Guarda só referências: fotoId, nunca imagens.
import { repo } from '../storage/index.js';
import { obterFicha } from '../render/templates/index.js';

export const MOTOR_VERSAO = 1; // versão do formato do projeto gravado
export const ESTADOS = { rascunho: 'Rascunho', pronto: 'Pronto', exportado: 'Exportado', publicado: 'Publicado' };

const dataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
// fotoIds lista todas as fotos referenciadas (principal + extras), sem repetição: protege contra exclusão.
const comFotoIds = (p) => ({ ...p, fotoIds: [...new Set([p.fotoId, ...(p.fotosExtras ?? [])].filter(Boolean))] });

export async function criarProjeto(templateId) {
  const ficha = obterFicha(templateId);
  if (!ficha) throw new Error(`Template desconhecido: ${templateId}`);
  return repo.inserir('projetos', {
    nome: `${ficha.nome} · ${dataCurta.format(new Date())}`,
    tipo: 'peca', estado: 'rascunho', situacao: 'ativo',
    templateId, formato: ficha.formatos[0], campos: ficha.padroes(),
    fotoId: null, fotosExtras: [], fotoIds: [], enquadramentos: {}, motorVersao: MOTOR_VERSAO,
  });
}

export const obterProjeto = (id) => repo.obter('projetos', id);

// patch: qualquer subconjunto de { nome, formato, campos, fotoId, fotosExtras, enquadramentos, estado }.
export async function salvarProjeto(id, patch) {
  return repo.atualizar('projetos', id, (atual) => comFotoIds({ ...atual, ...patch }));
}

export async function listarProjetos() {
  const todos = await repo.listar('projetos', { indice: 'atualizadoEm', direcao: 'desc' });
  return todos.filter((p) => p.situacao === 'ativo');
}
