// Fluxo vertical (Etapa 6): elemento "fluxo" da estrutura C para os cartões com conteúdo variável
// (INF-01 a INF-04, INS-02, COM-01, COM-02). Os blocos são medidos, empilhados de cima para baixo
// numa região [topo, base] e, se não couberem, os textos com faixa descem de 2 em 2 px até o mínimo.
// Nunca trunca texto. Blocos:
//   texto    { campo | fixo | valor(c), estilo, faixa | tam, maxLinhas, obrigatorio, cor, largura }
//   pilula   { campo | valor(c), tipo: 'cta' | 'selo', fundo, cor }
//   logo     { w, disco? { cor, alpha, r } }
//   icone    { campo, azulejo, tam }               ícone do conjunto num azulejo Turquesa a 15%
//   estrelas { campo, tam, gap }                   cinco estrelas Sol (cheias até a nota)
//   grade    { campo, colunas, modo: 'lado' | 'pilha', azulejo, icone, fonte, cartao, pad }
//   linhas   { campo, modo: 'lado' | 'empilhado', colRotulo, cartao, sangrar }
//   passos   { campo, modo: 'lista' | 'grade', diam, conector, cartao }
//   cartao   { fundo, pad, raio, blocos }          contêiner
//   linha    { blocos: [esquerda, direita] }       dois blocos na mesma linha (ex.: logotipo + pílula)
//   filete   { w, h, cor }                         traço decorativo
//   espaco   { h }  ·  flex {}                     espaço fixo ou elástico
// Cada bloco aceita "gap" (espaço depois; 24 por padrão) e "se(c)" (condição).
import { COR, TITULO, LOGO, COMPONENTES, ESP } from './tokens.js';
import { ajustar, larguraTexto } from './texto.js';

export const EST = {
  rotulo: { familia: 'Inter', peso: 600, tracking: 0.08, caixaAlta: true, entrelinha: 1.2 },
  titulo: { ...TITULO },
  subtitulo: { familia: 'Inter', peso: 500, tracking: 0, entrelinha: 1.3 },
  semi: { familia: 'Inter', peso: 600, tracking: 0, entrelinha: 1.25 },
  linhaCom: { familia: 'Inter', peso: 500, tracking: 0, entrelinha: 1.3 },
  regular: { familia: 'Inter', peso: 400, tracking: 0, entrelinha: 1.35 },
  numero: { ...TITULO, tracking: 0, entrelinha: 1 },
  pilula: { ...TITULO, tracking: 0, entrelinha: 1 },
};
const PILULAS = {
  cta: { altura: COMPONENTES.pilula.altura, padX: COMPONENTES.pilula.padX, fonte: { feed: 36, stories: 36 }, est: EST.pilula },
  tag: { altura: COMPONENTES.tagTipo.altura, padX: COMPONENTES.tagTipo.padX, fonte: { feed: COMPONENTES.tagTipo.fonte, stories: COMPONENTES.tagTipo.fonte }, est: { familia: 'Inter', peso: 600, tracking: 0, entrelinha: 1 } },
  selo: { altura: 64, padX: 32, fonte: { feed: 28, stories: 32 }, est: { ...EST.semi, entrelinha: 1 } },
};

export const porF = (v, F) => (v && typeof v === 'object' && !Array.isArray(v) ? v[F.id] : v);
export const val = (v, c) => (typeof v === 'function' ? v(c) : v);
const vazio = (v) => v == null || (typeof v === 'string' && !v.trim());

// [min, max, reduzivel] com o máximo reduzido em k px; nunca abaixo do mínimo da identidade.
function faixa(f, F, k, fixo = false) {
  const v = porF(f, F);
  const [a, b] = Array.isArray(v) ? v : [v, v];
  const min = Math.max(a, F.minFonte);
  const max = fixo ? Math.max(min, b) : Math.max(min, b - k);
  return [min, max, !fixo && max > min];
}

function textoDe(b, c) {
  if (b.fixo != null) return b.fixo;
  if (b.valor) return b.valor(c);
  return c[b.campo];
}

const MEDIR = {
  texto(X, b, W) {
    const t = textoDe(b, X.c);
    if (vazio(t)) { if (b.obrigatorio) X.prob('bloqueio', b.campo, `${b.rotulo} é obrigatório.`); return null; }
    const est = EST[b.estilo];
    const [min, max, reduz] = faixa(b.faixa ?? b.tam, X.F, X.k);
    const larg = b.largura ? Math.min(W, porF(b.largura, X.F)) : W;
    const r = ajustar(X.ctx, String(t), est, [min, max], larg, b.maxLinhas ?? Infinity, est.entrelinha);
    if (!r.cabe) X.prob(b.obrigatorio ? 'bloqueio' : 'aviso', b.campo, `${b.rotulo}: o texto não cabe (${r.motivo}). Encurte-o.`);
    const cor = val(b.cor, X.c) ?? COR.oceano;
    return { h: r.altura, w: r.largura, reduz, cmds: (x, y, Wd, al) => [{ t: 'texto', x: al === 'centro' ? x + Wd / 2 : x, y, linhas: r.linhas, tam: r.tam, lh: r.tam * est.entrelinha, est, cor, alinh: al === 'centro' ? 'centro' : 'esq' }] };
  },

  pilula(X, b, W) {
    const t = textoDe(b, X.c);
    if (vazio(t)) { if (b.obrigatorio) X.prob('bloqueio', b.campo, `${b.rotulo} é obrigatório.`); return null; }
    const P = PILULAS[b.tipo ?? 'cta'], tam = porF(P.fonte, X.F);
    const w = larguraTexto(X.ctx, String(t), P.est, tam) + 2 * P.padX;
    if (w > W + 0.5) X.prob(b.obrigatorio ? 'bloqueio' : 'aviso', b.campo, `${b.rotulo}: o texto não cabe numa linha.`);
    const fundo = val(b.fundo, X.c) ?? COR.lima, cor = val(b.cor, X.c) ?? COR.oceano;
    return { h: P.altura, w, cmds: (x, y, Wd, al) => {
      const x0 = al === 'centro' ? x + (Wd - w) / 2 : al === 'dir' ? x + Wd - w : x;
      return [
        { t: 'caixa', x: x0, y, w, h: P.altura, raio: P.altura / 2, cor: fundo },
        { t: 'texto', x: x0 + w / 2, y, linhas: [String(t)], tam, lh: P.altura, est: P.est, cor, alinh: 'centro' },
      ];
    } };
  },

  logo(X, b) {
    const w = porF(b.w, X.F), h = Math.round(w * LOGO.altura / LOGO.largura);
    return { h, w, cmds: (x, y, Wd, al) => {
      const x0 = al === 'centro' ? x + (Wd - w) / 2 : al === 'dir' ? x + Wd - w : x;
      const out = [];
      if (b.disco) { const r = porF(b.disco.r, X.F); out.push({ t: 'caixa', x: x0 + w / 2 - r, y: y + h / 2 - r, w: 2 * r, h: 2 * r, raio: r, cor: b.disco.cor, alpha: b.disco.alpha ?? 1 }); }
      out.push({ t: 'logo', x: Math.round(x0), y: Math.round(y), w, h });
      return out;
    } };
  },

  icone(X, b) {
    const id = b.id ?? X.c[b.campo];
    if (vazio(id)) return null;
    const A = porF(b.azulejo, X.F), T = porF(b.tam, X.F);
    return { h: A, w: A, cmds: (x, y, Wd, al) => {
      const x0 = al === 'centro' ? x + (Wd - A) / 2 : al === 'dir' ? x + Wd - A : x;
      return [
        { t: 'caixa', x: x0, y, w: A, h: A, raio: b.raio ?? 24, cor: COR.turquesa, alpha: 0.15 },
        { t: 'icone', id, cx: x0 + A / 2, cy: y + A / 2, tam: T, cor: COR.oceano },
      ];
    } };
  },

  estrelas(X, b) {
    const T = porF(b.tam, X.F), g = b.espaco ?? 12;
    const nota = Math.max(1, Math.min(5, Math.round(Number(X.c[b.campo] ?? 5)) || 5));
    const w = 5 * T + 4 * g;
    return { h: T, w, cmds: (x, y, Wd, al) => {
      const x0 = al === 'centro' ? x + (Wd - w) / 2 : x;
      return Array.from({ length: 5 }, (_, i) => ({ t: 'icone', id: 'estrela', cx: x0 + i * (T + g) + T / 2, cy: y + T / 2, tam: T, cor: COR.sol, preenchido: i < nota }));
    } };
  },

  filete(X, b, W) {
    const w = porF(b.w, X.F) ?? W, h = b.h ?? 4;
    return { h, w, cmds: (x, y) => [{ t: 'caixa', x, y, w, h, raio: 0, cor: val(b.cor, X.c) ?? COR.turquesa }] };
  },

  espaco(X, b) { return { h: porF(b.h, X.F), cmds: () => [] }; },

  // INF-01: grade de ícones (2 colunas por até 4 linhas).
  grade(X, b, W) {
    const itens = (X.c[b.campo] ?? []).slice(0, 8);
    const cols = b.colunas ?? 2, gc = porF(b.gapColuna ?? 48, X.F), gl = porF(b.gapLinha ?? 48, X.F);
    const A = porF(b.azulejo, X.F), I = porF(b.icone, X.F), fonte = porF(b.fonte, X.F);
    const pad = b.cartao ? porF(b.pad ?? 24, X.F) : 0, est = EST.semi;
    const colW = (W - gc * (cols - 1)) / cols;
    const textoW = b.modo === 'pilha' ? colW - 2 * pad : colW - 2 * pad - A - 24;
    const celulas = itens.map((it, i) => {
      if (vazio(it.texto)) X.prob('bloqueio', b.campo, `Item ${i + 1}: escreva o texto.`);
      if (!it.icone) X.prob('bloqueio', b.campo, `Item ${i + 1}: escolha um ícone.`);
      const r = ajustar(X.ctx, it.texto ?? '', est, [fonte, fonte], textoW, 2, est.entrelinha);
      if (!r.cabe) X.prob('bloqueio', b.campo, `Item ${i + 1}: o texto não cabe (${r.motivo}). Encurte-o.`);
      const h = (b.modo === 'pilha' ? A + 24 + r.altura : Math.max(A, r.altura)) + 2 * pad;
      return { it, r, h };
    });
    const linhas = [];
    for (let i = 0; i < celulas.length; i += cols) linhas.push(celulas.slice(i, i + cols));
    const alturas = linhas.map((l) => Math.max(...l.map((c) => c.h)));
    const h = alturas.reduce((s, a) => s + a, 0) + Math.max(0, linhas.length - 1) * gl;
    const fundo = val(b.cartao, X.c);
    return { h, cmds: (x, y) => {
      const out = [];
      let yy = y;
      linhas.forEach((l, li) => {
        l.forEach((cel, ci) => {
          const cx = x + ci * (colW + gc), H = alturas[li];
          if (fundo) out.push({ t: 'caixa', x: cx, y: yy, w: colW, h: H, raio: 24, cor: fundo });
          const ax = cx + pad, ay = b.modo === 'pilha' ? yy + pad : yy + (H - A) / 2;
          out.push({ t: 'caixa', x: ax, y: ay, w: A, h: A, raio: 24, cor: COR.turquesa, alpha: 0.15 });
          out.push({ t: 'icone', id: cel.it.icone, cx: ax + A / 2, cy: ay + A / 2, tam: I, cor: COR.oceano });
          const tx = b.modo === 'pilha' ? ax : ax + A + 24;
          const ty = b.modo === 'pilha' ? ay + A + 24 : yy + (H - cel.r.altura) / 2;
          out.push({ t: 'texto', x: tx, y: ty, linhas: cel.r.linhas, tam: cel.r.tam, lh: cel.r.tam * est.entrelinha, est, cor: COR.oceano, alinh: 'esq' });
        });
        yy += alturas[li] + gl;
      });
      return out;
    } };
  },

  // INF-02: linhas rótulo/valor num cartão, separadas por filete Turquesa de 2 px.
  linhas(X, b, W) {
    const lst = (X.c[b.campo] ?? []).slice(0, 6);
    const pad = 48, inner = W - 2 * pad, sep = porF(b.sep ?? 24, X.F);
    const [rmin, rmax, rred] = faixa(b.fonteRotulo, X.F, X.k);
    const [vmin, vmax, vred] = faixa(b.fonteValor, X.F, X.k);
    const colR = porF(b.colRotulo, X.F);
    const rows = lst.map((l, i) => {
      if (vazio(l.rotulo) || vazio(l.valor)) X.prob('bloqueio', b.campo, `Linha ${i + 1}: preencha o rótulo e o valor.`);
      const lado = b.modo === 'lado';
      const rr = ajustar(X.ctx, l.rotulo ?? '', EST.semi, [rmin, rmax], lado ? colR : inner, lado ? 2 : 1, EST.semi.entrelinha);
      const rv = ajustar(X.ctx, l.valor ?? '', EST.regular, [vmin, vmax], lado ? inner - colR - 24 : inner, 3, EST.regular.entrelinha);
      if (!rr.cabe) X.prob('bloqueio', b.campo, `Linha ${i + 1}: o rótulo não cabe (${rr.motivo}). Encurte-o.`);
      if (!rv.cabe) X.prob('bloqueio', b.campo, `Linha ${i + 1}: o valor não cabe (${rv.motivo}). Encurte-o.`);
      return { rr, rv, h: lado ? Math.max(rr.altura, rv.altura) : rr.altura + 8 + rv.altura };
    });
    if (!rows.length) return null;
    const h = 2 * pad + rows.reduce((s, r) => s + r.h, 0) + (rows.length - 1) * (2 * sep + 2);
    const fundo = val(b.cartao, X.c);
    return { h, reduz: rred || vred, cmds: (x, y, Wd) => {
      const out = [];
      if (fundo) {
        if (b.sangrar) out.push({ t: 'caixa', x, y, w: X.F.largura - x, h, raio: [24, 0, 0, 24], cor: fundo });
        else out.push({ t: 'caixa', x, y, w: Wd, h, raio: 24, cor: fundo });
      }
      let yy = y + pad;
      rows.forEach((r, i) => {
        const tx = x + pad;
        out.push({ t: 'texto', x: tx, y: yy, linhas: r.rr.linhas, tam: r.rr.tam, lh: r.rr.tam * EST.semi.entrelinha, est: EST.semi, cor: COR.oceano, alinh: 'esq' });
        const vx = b.modo === 'lado' ? tx + colR + 24 : tx, vy = b.modo === 'lado' ? yy : yy + r.rr.altura + 8;
        out.push({ t: 'texto', x: vx, y: vy, linhas: r.rv.linhas, tam: r.rv.tam, lh: r.rv.tam * EST.regular.entrelinha, est: EST.regular, cor: COR.oceano, alinh: 'esq' });
        yy += r.h;
        if (i < rows.length - 1) { yy += sep; out.push({ t: 'caixa', x: tx, y: yy, w: inner, h: 2, raio: 0, cor: COR.turquesa }); yy += 2 + sep; }
      });
      return out;
    } };
  },

  // INF-03: passos numerados (círculo Turquesa com número Oceano em Sora Bold).
  passos(X, b, W) {
    const lst = (X.c[b.campo] ?? []).slice(0, 4);
    const D = porF(b.diam, X.F), gap = porF(b.gap ?? 48, X.F), pad = b.cartao ? 32 : 0;
    const [tmin, tmax, tred] = faixa(b.fonteTitulo, X.F, X.k);
    const [amin, amax, ared] = faixa(b.fonteApoio, X.F, X.k);
    const numTam = Math.round(D * 0.5);
    const grade = b.modo === 'grade', cols = grade ? 2 : 1, gc = 48;
    const colW = (W - gc * (cols - 1)) / cols;
    const textoW = grade ? colW - 2 * pad : colW - 2 * pad - D - 32;
    const cel = lst.map((p, i) => {
      if (vazio(p.titulo)) X.prob('bloqueio', b.campo, `Passo ${i + 1}: escreva o título.`);
      const rt = ajustar(X.ctx, p.titulo ?? '', EST.semi, [tmin, tmax], textoW, 2, EST.semi.entrelinha);
      if (!rt.cabe) X.prob('bloqueio', b.campo, `Passo ${i + 1}: o título não cabe (${rt.motivo}). Encurte-o.`);
      let ra = null;
      if (!vazio(p.apoio)) {
        ra = ajustar(X.ctx, p.apoio, EST.regular, [amin, amax], textoW, 3, EST.regular.entrelinha);
        if (!ra.cabe) X.prob('aviso', b.campo, `Passo ${i + 1}: o apoio não cabe (${ra.motivo}). Encurte-o.`);
      }
      const hT = rt.altura + (ra ? 8 + ra.altura : 0);
      return { rt, ra, hT, h: (grade ? D + 24 + hT : Math.max(D, hT)) + 2 * pad };
    });
    if (!cel.length) return null;
    const linhas = [];
    for (let i = 0; i < cel.length; i += cols) linhas.push(cel.slice(i, i + cols));
    const alt = linhas.map((l) => Math.max(...l.map((c) => c.h)));
    const h = alt.reduce((s, a) => s + a, 0) + (linhas.length - 1) * gap;
    const fundo = val(b.cartao, X.c);
    return { h, reduz: tred || ared, cmds: (x, y) => {
      const out = [];
      let yy = y, n = 0;
      linhas.forEach((l, li) => {
        l.forEach((c, ci) => {
          n += 1;
          const cx = x + ci * (colW + gc), H = alt[li];
          if (fundo) out.push({ t: 'caixa', x: cx, y: yy, w: colW, h: H, raio: 24, cor: fundo });
          const ox = cx + pad, oy = grade ? yy + pad : yy + pad + Math.max(0, (H - 2 * pad - Math.max(D, c.hT)) / 2);
          const circY = grade ? oy : oy + Math.max(0, (c.hT - D) / 2);
          if (b.conector && !grade && li < linhas.length - 1) out.push({ t: 'caixa', x: ox + D / 2 - 2, y: circY + D, w: 4, h: yy + H + gap - circY - D + Math.max(0, (Math.max(D, cel[n]?.hT ?? D) - D) / 2), raio: 0, cor: COR.turquesa });
          out.push({ t: 'caixa', x: ox, y: circY, w: D, h: D, raio: D / 2, cor: COR.turquesa });
          out.push({ t: 'texto', x: ox + D / 2, y: circY + D / 2 - numTam / 2, linhas: [String(n)], tam: numTam, lh: numTam, est: EST.numero, cor: COR.oceano, alinh: 'centro' });
          const tx = grade ? ox : ox + D + 32;
          let ty = grade ? oy + D + 24 : oy + Math.max(0, (D - c.hT) / 2);
          out.push({ t: 'texto', x: tx, y: ty, linhas: c.rt.linhas, tam: c.rt.tam, lh: c.rt.tam * EST.semi.entrelinha, est: EST.semi, cor: COR.oceano, alinh: 'esq' });
          if (c.ra) { ty += c.rt.altura + 8; out.push({ t: 'texto', x: tx, y: ty, linhas: c.ra.linhas, tam: c.ra.tam, lh: c.ra.tam * EST.regular.entrelinha, est: EST.regular, cor: COR.oceano, alinh: 'esq' }); }
        });
        yy += alt[li] + gap;
      });
      return out;
    } };
  },

  cartao(X, b, W) {
    const pad = porF(b.pad ?? 48, X.F);
    const filhos = medirLista(X, b.blocos, W - 2 * pad);
    if (!filhos.length) return null;
    const hc = alturaLista(filhos);
    const fundo = val(b.fundo, X.c);
    return { h: hc + 2 * pad, reduz: filhos.some((f) => f.m.reduz), cmds: (x, y, Wd, al) => {
      const out = [];
      if (b.sangrar === 'base') out.push({ t: 'caixa', x: 0, y, w: X.F.largura, h: X.F.altura - y, raio: [24, 24, 0, 0], cor: fundo });
      else if (b.sangrar === 'direita') out.push({ t: 'caixa', x, y, w: X.F.largura - x, h: hc + 2 * pad, raio: [24, 0, 0, 24], cor: fundo });
      else out.push({ t: 'caixa', x, y, w: Wd, h: hc + 2 * pad, raio: b.raio ?? 24, cor: fundo });
      out.push(...desenharLista(filhos, x + pad, y + pad, Wd - 2 * pad, b.alinh ?? al, 0));
      return out;
    } };
  },

  linha(X, b, W) {
    const [e, d] = b.blocos.map((bl) => (bl && (!bl.se || bl.se(X.c)) ? MEDIR[bl.b](X, bl, W) : null));
    if (!e && !d) return null;
    if (e && d && (e.w ?? 0) + (d.w ?? 0) + 24 > W) X.prob('bloqueio', null, 'Os elementos do rodapé não cabem lado a lado. Encurte a chamada.');
    const h = Math.max(e?.h ?? 0, d?.h ?? 0);
    return { h, cmds: (x, y, Wd) => [
      ...(e ? e.cmds(x, y + (h - e.h) / 2, Wd, 'esq') : []),
      ...(d ? d.cmds(x, y + (h - d.h) / 2, Wd, 'dir') : []),
    ] };
  },
};

function medirLista(X, blocos, W) {
  const out = [];
  for (const b of blocos) {
    if (b.se && !b.se(X.c)) continue;
    if (b.b === 'flex') { out.push({ b, flex: true, m: { h: 0 } }); continue; }
    const m = MEDIR[b.b](X, b, W);
    if (m) out.push({ b, m });
  }
  // Sem espaço depois do último bloco nem antes/depois de um flex.
  return out;
}
const gapDe = (lista, i) => (i < lista.length - 1 && !lista[i].flex && !lista[i + 1].flex ? lista[i].b.gap ?? ESP.u : 0);
function alturaLista(lista) { return lista.reduce((s, it, i) => s + it.m.h + gapDe(lista, i), 0); }
function desenharLista(lista, x, y, W, al, sobra) {
  const nf = lista.filter((it) => it.flex).length;
  const out = [];
  lista.forEach((it, i) => {
    if (it.flex) { y += sobra / nf; return; }
    out.push(...it.m.cmds(x, y, W, it.b.alinh ?? al));
    y += it.m.h + gapDe(lista, i);
  });
  return out;
}

// el: { t: 'fluxo', x, largura, topo, base, alinhar: 'topo' | 'centro' | 'base', alinh: 'esq' | 'centro', painel, blocos }
export function comporFluxo(ctx, el, d, F, cena) {
  const c = d.campos;
  const x = porF(el.x, F), W = porF(el.largura, F), topo = porF(el.topo, F), base = porF(el.base, F);
  const pad = el.painel ? COMPONENTES.vidro.padding : 0;
  const disp = base - topo - 2 * pad;
  const medir = (k) => {
    const problemas = [];
    const X = { ctx, F, c, k, prob: (nivel, campo, texto) => problemas.push({ nivel, campo, texto }) };
    const lista = medirLista(X, el.blocos, W - 2 * pad);
    return { lista, problemas, total: alturaLista(lista) };
  };
  let r = medir(0);
  for (let k = 2; r.total > disp && r.lista.some((it) => it.m.reduz) && k <= 80; k += 2) r = medir(k);
  const vistos = new Set();
  for (const p of r.problemas) {
    const chave = `${p.nivel}|${p.campo}|${p.texto}`;
    if (vistos.has(chave)) continue; vistos.add(chave);
    (p.nivel === 'bloqueio' ? cena.bloqueios : cena.avisos).push({ campo: p.campo, texto: p.texto });
  }
  if (r.total > disp + 0.5) cena.bloqueios.push({ campo: null, texto: el.mensagemNaoCabe ?? 'O conteúdo não cabe no espaço desta composição. Encurte os textos, use menos itens ou escolha outra composição.' });
  if (!r.lista.some((it) => !it.flex)) return;
  const nf = r.lista.filter((it) => it.flex).length;
  const sobra = Math.max(0, disp - r.total);
  let y0 = topo + pad;
  if (!nf && el.alinhar === 'centro') y0 = topo + pad + sobra / 2;
  else if (!nf && el.alinhar === 'base') y0 = base - pad - r.total;
  if (el.painel) {
    const altura = nf ? disp + 2 * pad : r.total + 2 * pad;
    cena.comandos.push({ t: 'vidro', x, y: y0 - pad, w: W, h: altura, ...COMPONENTES.vidro });
  }
  cena.comandos.push(...desenharLista(r.lista, x + pad, y0, W - 2 * pad, el.alinh ?? 'esq', nf ? sobra : 0));
}
