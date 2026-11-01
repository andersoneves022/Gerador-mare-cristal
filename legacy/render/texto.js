// Medição, quebra de linha e fitagem de texto. Nunca reduz abaixo do mínimo e nunca trunca.
import { PASSO_FITAGEM } from './tokens.js';

let ctxMedida = null;
export const contextoMedida = () => (ctxMedida ??= document.createElement('canvas').getContext('2d'));

// est: { familia, peso, tracking (fração do tamanho), caixaAlta }
export function aplicarFonte(ctx, est, tam) {
  ctx.font = `${est.peso} ${tam}px ${est.familia}`;
  ctx.letterSpacing = `${((est.tracking ?? 0) * tam).toFixed(3)}px`;
  ctx.textBaseline = 'middle';
}

export function larguraTexto(ctx, texto, est, tam) {
  aplicarFonte(ctx, est, tam);
  return ctx.measureText(est.caixaAlta ? texto.toUpperCase() : texto).width;
}

// Quebra gulosa por palavras; respeita quebras de linha digitadas. Palavra maior que a largura fica sozinha.
export function quebrar(ctx, texto, est, tam, larguraMax) {
  const linhas = [];
  for (const par of String(texto).split(/\r?\n/)) {
    const palavras = par.trim().split(/\s+/).filter(Boolean);
    if (!palavras.length) continue;
    let atual = palavras[0];
    for (const p of palavras.slice(1)) {
      const teste = `${atual} ${p}`;
      if (larguraTexto(ctx, teste, est, tam) <= larguraMax) atual = teste;
      else { linhas.push(atual); atual = p; }
    }
    linhas.push(atual);
  }
  return linhas;
}

// faixa: [min, max]. Devolve { tam, linhas, altura, largura, cabe, motivo }.
export function ajustar(ctx, texto, est, faixa, larguraMax, maxLinhas = Infinity, entrelinha = 1.35) {
  const [min, max] = faixa;
  let ultimo = null;
  for (let tam = max; tam >= min; tam -= PASSO_FITAGEM) {
    const t = Math.max(tam, min);
    const linhas = quebrar(ctx, texto, est, t, larguraMax);
    const larg = Math.max(0, ...linhas.map((l) => larguraTexto(ctx, l, est, t)));
    const cabeLargura = larg <= larguraMax + 0.5;
    const cabeLinhas = linhas.length <= maxLinhas;
    ultimo = { tam: t, linhas, largura: larg, altura: linhas.length * t * entrelinha, cabe: cabeLargura && cabeLinhas,
      motivo: !cabeLargura ? 'uma palavra é mais larga que o espaço disponível' : !cabeLinhas ? `passa de ${maxLinhas} linha(s)` : null };
    if (ultimo.cabe) return ultimo;
    if (t === min) break;
  }
  return ultimo ?? { tam: min, linhas: [], largura: 0, altura: 0, cabe: true, motivo: null };
}
