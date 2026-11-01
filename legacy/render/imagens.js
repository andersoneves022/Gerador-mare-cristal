// Carrega as imagens usadas pelo motor. Prévia: cópia de trabalho (≤ 2048 px). O original nunca é alterado.
// Limite de fotografias decodificadas ao mesmo tempo (Especificação §13.3: 2). A Etapa 4.1 eleva para 3,
// o máximo de fotos de uma peça (INS-01 C no Feed).
import { repo } from '../storage/index.js';
import { obterDerivado } from '../biblioteca/fotos.js';
import { LOGO } from './tokens.js';

const cache = new Map(); // fotoId -> { meta, bitmap, ratio }
const MAX = 4;

export async function imagemDaFoto(fotoId) {
  if (!fotoId) return null;
  const meta = await repo.obter('fotos', fotoId);
  if (!meta) { descartar(fotoId); return null; }
  const hit = cache.get(fotoId);
  if (hit) { cache.delete(fotoId); cache.set(fotoId, { ...hit, meta }); return cache.get(fotoId); }
  const blob = await obterDerivado(fotoId, 'trabalho');
  if (!blob) return null;
  const bitmap = await createImageBitmap(blob);
  cache.set(fotoId, { meta, bitmap, ratio: bitmap.width / meta.largura });
  while (cache.size > MAX) { const [k] = cache.keys(); descartar(k); }
  return cache.get(fotoId);
}
function descartar(id) { cache.get(id)?.bitmap.close?.(); cache.delete(id); }

let logoPromessa = null;
export const carregarLogo = () => (logoPromessa ??= fetch(LOGO.arquivo).then((r) => r.blob()).then(createImageBitmap));

// fotoIds: id da foto principal, ou lista [principal, secundária, terceira]. Devolve
// { imagem (principal), imagens: { 1, 2, 3 }, logo }. Carrega em sequência para respeitar o limite do cache.
export async function prepararRecursos(fotoIds) {
  const ids = (Array.isArray(fotoIds) ? fotoIds : [fotoIds]).slice(0, MAX);
  const imagens = {};
  for (let i = 0; i < ids.length; i++) imagens[i + 1] = await imagemDaFoto(ids[i]);
  const logo = await carregarLogo();
  return { imagem: imagens[1] ?? null, imagens, logo };
}
