// Estrutura fixa da interface: lateral com menu e área principal.
import { h } from '../core/dom.js';
import { AREAS, APP_VERSAO } from '../config.js';
import { estadoFontes, aoMudarFontes } from '../core/fonts.js';
import { estadoArmazenamento } from '../storage/estado.js';
import { VIEWS } from './views/index.js';
import { subRota } from './router.js';

export function montarShell(raiz) {
  const links = new Map();
  const menu = h('ul', { classe: 'menu' }, AREAS.map((a) => {
    const link = h('a', { href: `#/${a.id}` }, a.rotulo);
    links.set(a.id, link);
    return h('li', {}, link);
  }));

  const statusFontes = h('span', {});
  const pintarFontes = (e) => {
    statusFontes.textContent = !e.pronto ? 'Fontes: carregando'
      : e.ausentes.length ? `Fontes: faltam ${e.ausentes.length} de 4`
      : 'Fontes: 4 de 4 carregadas';
  };
  pintarFontes(estadoFontes());
  aoMudarFontes(pintarFontes);

  const statusArmazenamento = h('span', {});
  const pintarArmazenamento = (e) => {
    statusArmazenamento.textContent = e.fase === 'pronto' ? 'Armazenamento: pronto'
      : e.fase === 'erro' ? 'Armazenamento: com problema'
      : 'Armazenamento: iniciando';
  };
  pintarArmazenamento(estadoArmazenamento.obter());
  estadoArmazenamento.assinar(pintarArmazenamento);

  const titulo = h('h1', { tabindex: '-1' });
  const corpo = h('div', {});

  raiz.replaceChildren(h('div', { classe: 'shell' },
    h('aside', { classe: 'lateral' },
      h('div', { classe: 'marca' },
        h('img', { src: '/assets/logo-aparado.png', alt: 'Cabanas Lobo do Mar' }),
        h('div', {},
          h('div', { classe: 'marca__nome' }, 'Gerador de conteúdo'),
          h('div', { classe: 'marca__sub' }, 'Praia do Rosa, SC'))),
      h('nav', { 'aria-label': 'Áreas do aplicativo' }, menu),
      h('div', { classe: 'lateral__rodape' }, statusArmazenamento, statusFontes, h('span', {}, `Versão ${APP_VERSAO}`))),
    h('main', { classe: 'principal' },
      h('header', { classe: 'principal__topo' }, titulo),
      corpo)));

  let atual = null; // view exibida; pode ter .limpar() para soltar recursos (URLs de imagem, assinaturas)

  return function mostrar(id, { foco = true } = {}) {
    const area = AREAS.find((a) => a.id === id);
    for (const [aid, link] of links) {
      if (aid === id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    titulo.textContent = area.titulo;
    document.title = `${area.titulo} · Gerador Cabanas Lobo do Mar`;
    atual?.limpar?.();
    atual = VIEWS[id](subRota());
    corpo.replaceChildren(atual);
    if (foco) titulo.focus({ preventScroll: true });
  };
}
