import { h } from '../../core/dom.js';

// Estado vazio honesto para áreas ainda não implementadas.
export function emConstrucao(titulo, texto) {
  return h('div', { classe: 'vazio' },
    h('h2', {}, titulo),
    h('p', {}, texto));
}
