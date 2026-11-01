// Conjunto PROVISÓRIO de 12 ícones de linha (grade de 48 px, traço de 2 px, pontas arredondadas).
// Pendente de aprovação (Manual §17.4). Trocar este arquivo não afeta o motor.
const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
const elip = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;

export const ICONES = {
  cozinha:        { rotulo: 'Cozinha',          d: 'M10 20h28v12a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z M12 20v-2a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v2 M24 16v-4 M10 26H5 M38 26h5' },
  banheiro:       { rotulo: 'Banheiro',         d: 'M6 24h36v6a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8z M12 24V12a4 4 0 0 1 8 0 M10 38l-2 5 M38 38l2 5' },
  churrasqueira:  { rotulo: 'Churrasqueira',    d: 'M8 22h32a16 16 0 0 1-32 0z M16 36l-4 8 M32 36l4 8 M18 15c0-3 3-4 3-8 M27 15c0-3 3-4 3-8' },
  estacionamento: { rotulo: 'Estacionamento',   d: 'M12 6h24a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z M19 35V13h8a6 6 0 0 1 0 12h-8' },
  agua:           { rotulo: 'Água / cisterna',  d: 'M24 6c8 10 12 16 12 22a12 12 0 0 1-24 0c0-6 4-12 12-22z M17 29a7 7 0 0 0 6 6' },
  wifi:           { rotulo: 'Wi-Fi',            d: 'M6 18a26 26 0 0 1 36 0 M12 25a18 18 0 0 1 24 0 M18 32a9 9 0 0 1 12 0 M24 39.5h.01' },
  ventilador:     { rotulo: 'Ventilador',       d: `${circ(24, 24, 3)} M21.5 22C17 17 17 9 22 7c5-1 7 5 5 11 M26 21c6-3 14-1 15 5 0 5-6 6-11 3 M24 27c-2 7-8 12-13 9-4-3-2-9 4-11` },
  rede:           { rotulo: 'Rede',             d: 'M7 6v36 M41 6v36 M7 14c5 20 29 20 34 0 M7 14h34' },
  pet:            { rotulo: 'Pet',              d: `M24 26c-6 0-11 5-11 9 0 4 4 4 11 3 7 1 11 1 11-3 0-4-5-9-11-9z ${elip(11, 22, 3, 4.5)} ${elip(19, 12, 3, 4.5)} ${elip(29, 12, 3, 4.5)} ${elip(37, 22, 3, 4.5)}` },
  localizacao:    { rotulo: 'Localização',      d: `M24 43c-8-9-14-15-14-23a14 14 0 0 1 28 0c0 8-6 14-14 23z ${circ(24, 20, 5)}` },
  whatsapp:       { rotulo: 'WhatsApp',         d: 'M24 6a18 18 0 1 0 9 33.5L42 42l-2.5-8.7A18 18 0 0 0 24 6z M17 15c0 9 8 17 16 17l2-4-5-2-2 2c-3-1-5-3-6-6l2-2-2-5z' },
  estrela:        { rotulo: 'Estrela',          d: 'M24 6l5.6 11.4 12.4 1.8-9 8.7 2.1 12.4L24 34.6l-11.1 5.7 2.1-12.4-9-8.7 12.4-1.8z' },
};
export const LISTA_ICONES = Object.entries(ICONES).map(([id, i]) => ({ id, rotulo: i.rotulo }));

const cachePath = new Map();
// Desenha o ícone (traço apenas) centrado em (cx, cy), com lado `tam`. O traço escala com a grade de 48.
// preenchido: só para as estrelas do INS-02 (nota); os demais ícones são sempre de linha.
export function desenharIcone(ctx, id, cx, cy, tam, cor, preenchido = false) {
  const ic = ICONES[id];
  if (!ic) return false;
  if (!cachePath.has(id)) cachePath.set(id, new Path2D(ic.d));
  const k = tam / 48;
  ctx.save();
  ctx.translate(cx - tam / 2, cy - tam / 2);
  ctx.scale(k, k);
  ctx.strokeStyle = cor; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (preenchido) { ctx.fillStyle = cor; ctx.fill(cachePath.get(id)); }
  ctx.stroke(cachePath.get(id));
  ctx.restore();
  return true;
}
