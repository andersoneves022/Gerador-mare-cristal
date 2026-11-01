// Criar publicação: escolha do template. Com #/criar/<id>, abre o editor do projeto.
import { h } from '../../core/dom.js';
import { FICHAS, TEMPLATES_PENDENTES } from '../../render/templates/index.js';
import { FORMATOS } from '../../render/tokens.js';
import { criarProjeto } from '../../projetos/projetos.js';
import { iniciarArmazenamento } from '../../storage/estado.js';
import { renderEditor } from './editor.js';

export function renderCriar(sub) {
  if (sub) return renderEditor(sub);
  const aviso = h('div', { role: 'alert' });
  const novo = async (id, botao) => {
    botao.disabled = true;
    try {
      await iniciarArmazenamento();
      const p = await criarProjeto(id);
      location.hash = `#/criar/${p.id}`;
    } catch (e) {
      botao.disabled = false;
      aviso.replaceChildren(h('div', { classe: 'aviso' }, h('span', { classe: 'aviso__selo' }, 'Problema'), h('p', {}, e?.mensagemUsuario ?? 'Não foi possível criar o projeto.')));
    }
  };
  return h('div', { classe: 'principal__corpo' },
    aviso,
    h('p', {}, 'Escolha o modelo da publicação. Depois você escolhe a fotografia, edita os textos e ajusta o enquadramento.'),
    h('ul', { classe: 'modelos' }, FICHAS.map((f) => {
      const b = h('button', { type: 'button', classe: 'botao', 'data-template': f.id }, 'Criar com este modelo');
      b.addEventListener('click', () => novo(f.id, b));
      return h('li', { classe: 'modelo' },
        h('div', { classe: 'modelo__id' }, f.id),
        h('h2', {}, f.nome),
        h('p', {}, f.descricao),
        h('p', { classe: 'nota' }, f.formatos.map((x) => FORMATOS[x].rotulo).join(' · ')),
        b);
    })),
    TEMPLATES_PENDENTES.length ? h('p', { classe: 'nota' }, `Próximos modelos da biblioteca: ${TEMPLATES_PENDENTES.join(', ')}.`)
      : h('p', { classe: 'nota', 'data-biblioteca-completa': '' }, `Os ${FICHAS.length} modelos da Biblioteca v0.2.1 estão disponíveis.`));
}
