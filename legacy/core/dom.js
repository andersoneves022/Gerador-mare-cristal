// Criação de elementos sem innerHTML (texto sempre tratado como texto).
export function h(tag, atributos = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (valor === false || valor == null) continue;
    if (chave === 'classe') el.className = valor;
    else if (chave.startsWith('on') && typeof valor === 'function') {
      el.addEventListener(chave.slice(2).toLowerCase(), valor);
    } else el.setAttribute(chave, valor === true ? '' : valor);
  }
  for (const filho of filhos.flat()) {
    if (filho == null || filho === false) continue;
    el.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
  }
  return el;
}

// Elementos SVG (ícones de traço). Também sem innerHTML.
const SVG_NS = 'http://www.w3.org/2000/svg';
export function svg(tag, atributos = {}, ...filhos) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [chave, valor] of Object.entries(atributos)) if (valor != null && valor !== false) el.setAttribute(chave, valor);
  el.append(...filhos.flat().filter(Boolean));
  return el;
}
