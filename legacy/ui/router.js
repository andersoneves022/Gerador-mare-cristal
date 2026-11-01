// Roteamento por hash (#/fotografias). Funciona em hospedagem estática, sem regras de servidor.
import { AREAS, AREA_INICIAL } from '../config.js';

const ids = new Set(AREAS.map((a) => a.id));

export function areaAtual() {
  const id = location.hash.replace(/^#\/?/, '').split('/')[0];
  return ids.has(id) ? id : AREA_INICIAL;
}

export function aoNavegar(fn) {
  window.addEventListener('hashchange', () => fn(areaAtual()));
  fn(areaAtual());
}

// Segundo trecho do hash (ex.: #/criar/<id> -> <id>).
export const subRota = () => location.hash.replace(/^#\/?/, '').split('/')[1] || null;
