// Componentes compartilhados pelas estruturas. Cada construtor mede e devolve:
//   { altura, largura, desenhar(xRef, y, alinh) -> comandos, problemas: [{ nivel, texto }] }
// alinh 'esq': xRef é a borda esquerda. alinh 'centro': xRef é o eixo.
import { COR, TITULO, COMPONENTES } from './tokens.js';
import { ajustar, larguraTexto } from './texto.js';

const INTER = (peso, extra = {}) => ({ familia: 'Inter', peso, tracking: 0, ...extra });
const porFormato = (v, F) => (v && typeof v === 'object' && !Array.isArray(v) ? v[F.id] : v);
const corDe = (cor, d, cena) => (typeof cor === 'function' ? cor(d, cena) : cor ?? COR.espuma);
const comandoTexto = (x, y, r, est, cor, alinh) => ({ t: 'texto', x, y, linhas: r.linhas, tam: r.tam, lh: r.tam * (est.entrelinha ?? 1.35), est, cor, alinh });

function textoAjustado(ctx, cfg, valor, F, larguraMax, d, cena, est) {
  const faixa = cfg.faixaDe ? cfg.faixaDe(d, F) : porFormato(cfg.faixa, F);
  const lh = est.entrelinha ?? 1.35;
  const maxL = typeof cfg.maxLinhas === 'function' ? cfg.maxLinhas(d) : cfg.maxLinhas ?? Infinity;
  const r = ajustar(ctx, valor, est, faixa, larguraMax, maxL, lh);
  const problemas = r.cabe ? [] : [{ nivel: cfg.obrigatorio ? 'bloqueio' : 'aviso', campo: cfg.campo, texto: `${cfg.rotulo}: o texto não cabe (${r.motivo}). Encurte-o.` }];
  const cor = corDe(cfg.cor, d, cena);
  return {
    altura: r.altura, largura: r.largura, problemas,
    desenhar: (x, y, alinh) => [comandoTexto(x, y, r, est, cor, alinh)],
  };
}

function pilulaPreenchida(ctx, cfg, valor, F, larguraMax, d, cena, { altura, padX, fonte, est, fundo, cor }) {
  const larg = larguraTexto(ctx, valor, est, fonte) + 2 * padX;
  const problemas = larg > larguraMax + 0.5 ? [{ nivel: cfg.obrigatorio ? 'bloqueio' : 'aviso', campo: cfg.campo, texto: `${cfg.rotulo}: o texto não cabe numa linha.` }] : [];
  return {
    altura, largura: larg, problemas,
    desenhar: (x, y, alinh) => {
      const x0 = alinh === 'centro' ? x - larg / 2 : x;
      return [
        { t: 'caixa', x: x0, y, w: larg, h: altura, raio: altura / 2, cor: fundo },
        { t: 'texto', x: x0 + larg / 2, y, linhas: [valor], tam: fonte, lh: altura, est, cor, alinh: 'centro' },
      ];
    },
  };
}

export const COMPONENTES_REGISTRO = {
  titulo: (ctx, cfg, v, F, lm, d, cena) => textoAjustado(ctx, cfg, v, F, lm, d, cena, { ...TITULO }),
  apoio: (ctx, cfg, v, F, lm, d, cena) => textoAjustado(ctx, cfg, v, F, lm, d, cena, { ...INTER(400), entrelinha: 1.35 }),
  legenda: (ctx, cfg, v, F, lm, d, cena) => textoAjustado(ctx, { ...cfg, maxLinhas: 1, faixa: { feed: [32, 32], stories: [32, 32], reels: [32, 32] } }, v, F, lm, d, cena,
    { ...INTER(600), entrelinha: 1.2 }),
  linha: (ctx, cfg, v, F, lm, d, cena) => textoAjustado(ctx, cfg, v, F, lm, d, cena, { ...INTER(500), entrelinha: 1.3 }),
  rotulo: (ctx, cfg, v, F, lm, d, cena) => textoAjustado(ctx, { ...cfg, faixa: { feed: [28, 28], stories: [32, 32], reels: [32, 32] } }, v, F, lm, d, cena,
    { ...INTER(600, { tracking: 0.08, caixaAlta: true }), entrelinha: 1.2 }),
  tagLocal: (ctx, cfg, v, F, lm, d, cena) => textoAjustado(ctx, { ...cfg, maxLinhas: 1, faixa: { feed: [32, 32], stories: [32, 32], reels: [32, 32] } }, v, F, lm, d, cena,
    { ...INTER(600), entrelinha: 1.2 }),
  // Pílula lima (CTA): Sora Bold (PT-03), texto Oceano.
  pilula: (ctx, cfg, v, F, lm, d, cena) => pilulaPreenchida(ctx, cfg, v, F, lm, d, cena, {
    ...COMPONENTES.pilula, est: { ...TITULO, tracking: 0 }, fundo: COR.lima, cor: COR.oceano }),
  // Tag preenchida de tipo (COM-01): cor definida pelo tipo; texto Oceano.
  tagTipo: (ctx, cfg, v, F, lm, d, cena) => pilulaPreenchida(ctx, cfg, v, F, lm, d, cena, {
    ...COMPONENTES.tagTipo, est: INTER(600), fundo: cfg.fundoDe(d), cor: COR.oceano }),
};
