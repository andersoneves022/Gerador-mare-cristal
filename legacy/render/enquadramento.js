// Enquadramento por cobertura (Especificação §7.3). Coordenadas relativas à fotografia ORIGINAL.
// enq = { zoom, cx, cy }: zoom ≥ 1 sobre a escala de cobertura; (cx, cy) = centro da janela visível (0..1).
export const escalaCobertura = (sw, sh, dw, dh) => Math.max(dw / sw, dh / sh);

// D-01: o zoom do usuário não amplia além de 1,00. Se a escala de cobertura já passa de 1,00 (foto menor que o
// espaço), o zoom fica em 1 e a peça segue com o aviso do nível de ampliação (nunca é bloqueada só por isso).
export const zoomMaximo = (sw, sh, dw, dh) => Math.max(1, Math.floor(1000 / escalaCobertura(sw, sh, dw, dh)) / 1000);

const entre = (v, a, b) => Math.min(b, Math.max(a, v));

export function normalizar(enq, foto, dw, dh) {
  const { largura: sw, altura: sh } = foto;
  const esc = escalaCobertura(sw, sh, dw, dh);
  const zoom = entre(Number.isFinite(enq?.zoom) ? enq.zoom : 1, 1, zoomMaximo(sw, sh, dw, dh));
  const meiaL = dw / (esc * zoom) / 2 / sw;
  const meiaA = dh / (esc * zoom) / 2 / sh;
  return {
    zoom,
    cx: entre(Number.isFinite(enq?.cx) ? enq.cx : 0.5, meiaL, 1 - meiaL),
    cy: entre(Number.isFinite(enq?.cy) ? enq.cy : 0.5, meiaA, 1 - meiaA),
  };
}

// Ponto de partida: ponto focal da biblioteca (não sobrescreve projetos já ajustados).
export const enquadramentoInicial = (foto, dw, dh) =>
  normalizar({ zoom: 1, cx: foto.pontoFocal?.x ?? 0.5, cy: foto.pontoFocal?.y ?? 0.5 }, foto, dw, dh);

// Janela de origem (px do original) e escala final.
export function janela(enq, foto, dw, dh) {
  const { largura: sw, altura: sh } = foto;
  const n = normalizar(enq, foto, dw, dh);
  const escalaFinal = escalaCobertura(sw, sh, dw, dh) * n.zoom;
  const w = dw / escalaFinal, h = dh / escalaFinal;
  return {
    ...n, escalaFinal, zoomMax: zoomMaximo(sw, sh, dw, dh),
    sx: n.cx * sw - w / 2, sy: n.cy * sh - h / 2, sw: w, sh: h,
    ampliacao: escalaFinal > 1.0001, nivelAmpliacao: nivelAmpliacao(escalaFinal),
  };
}

// D-01 (revisada): níveis de ampliação sobre o original. Até 100%: sem aviso; acima de 150%: aviso e
// confirmação por peça antes da exportação. A escala vem das dimensões do ORIGINAL e da área real da foto.
export const LIMITES_AMPLIACAO = { leve: 1.25, significativa: 1.5 };
export function nivelAmpliacao(escalaFinal) {
  if (!(escalaFinal > 1.0001)) return null;
  if (escalaFinal <= LIMITES_AMPLIACAO.leve + 1e-4) return 'leve';
  if (escalaFinal <= LIMITES_AMPLIACAO.significativa + 1e-4) return 'significativa';
  return 'elevada';
}
export const MENSAGENS_AMPLIACAO = {
  leve: 'Esta fotografia será ampliada para preencher o espaço. A qualidade poderá apresentar uma pequena redução.',
  significativa: 'Esta fotografia precisará de ampliação significativa. Verifique a nitidez do resultado.',
  elevada: 'A ampliação será elevada e poderá comprometer a nitidez. Confirme visualmente antes de exportar.',
};

// Registra o aviso do nível na cena; ampliação elevada também entra em cena.ampliacoesElevadas
// (a exportação pede confirmação da peça). rotulo: prefixo opcional (ex.: "Foto secundária").
export function avisarAmpliacao(cena, campo, j, rotulo = '') {
  const nivel = j.nivelAmpliacao;
  if (!nivel) return;
  const pct = Math.round(j.escalaFinal * 100);
  cena.avisos.push({ campo, nivel: `ampliacao-${nivel}`, texto: `${rotulo ? `${rotulo}: ` : ''}${MENSAGENS_AMPLIACAO[nivel]} (ampliação de ${pct}%)` });
  if (nivel === 'elevada') cena.ampliacoesElevadas.push({ campo, percentual: pct });
}
