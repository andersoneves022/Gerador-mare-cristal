import { h } from '../../core/dom.js';
import { iniciarArmazenamento } from '../../storage/estado.js';
import { listarProjetos, ESTADOS } from '../../projetos/projetos.js';
import { obterFicha } from '../../render/templates/index.js';
import { FORMATOS } from '../../render/tokens.js';

const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

export function renderProjetos() {
  const corpo = h('div', { classe: 'principal__corpo' }, h('p', { role: 'status' }, 'Carregando projetos…'));
  (async () => {
    try {
      await iniciarArmazenamento();
      const lista = await listarProjetos();
      if (!lista.length) {
        corpo.replaceChildren(h('div', { classe: 'vazio' }, h('h2', {}, 'Nenhum projeto ainda'),
          h('p', {}, 'Os rascunhos aparecem aqui assim que você criar uma publicação.'),
          h('div', {}, h('a', { classe: 'botao', href: '#/criar' }, 'Criar publicação'))));
        return;
      }
      corpo.replaceChildren(
        h('div', {}, h('a', { classe: 'botao', href: '#/criar' }, 'Nova publicação')),
        h('ul', { classe: 'projetos' }, lista.map((p) => h('li', { classe: 'projeto', 'data-projeto': p.id },
          h('div', { classe: 'projeto__info' },
            h('strong', {}, p.nome || 'Projeto sem nome'),
            h('span', { classe: 'nota' }, `${obterFicha(p.templateId)?.nome ?? p.templateId} · ${FORMATOS[p.formato]?.rotulo ?? p.formato}`),
            h('span', { classe: 'nota' }, `Alterado em ${dataHora.format(p.atualizadoEm)}`)),
          h('span', { classe: 'selo' }, ESTADOS[p.estado] ?? p.estado),
          h('a', { classe: 'botao botao--secundario', href: `#/criar/${p.id}` }, 'Abrir')))));
    } catch (e) {
      corpo.replaceChildren(h('div', { classe: 'aviso' }, h('span', { classe: 'aviso__selo' }, 'Problema'), h('p', {}, e?.mensagemUsuario ?? 'Não foi possível listar os projetos.')));
    }
  })();
  return corpo;
}
