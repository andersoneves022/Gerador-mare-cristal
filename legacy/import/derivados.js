// Decodifica uma fotografia UMA vez e gera miniatura e cópia de trabalho.
// O original nunca é alterado. Só um bitmap existe por vez (limite da Especificação §13.3).
import { IMPORTACAO } from '../config.js';
import { ErroImagem } from './formato.js';

function criarCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

async function paraBlob(canvas, tipo, qualidade) {
  if (canvas.convertToBlob) return canvas.convertToBlob({ type: tipo, quality: qualidade });
  return new Promise((ok) => canvas.toBlob(ok, tipo, qualidade));
}

// Reduz mantendo a proporção; nunca amplia.
async function reduzir(bitmap, ladoMaior, qualidade) {
  const escala = Math.min(1, ladoMaior / Math.max(bitmap.width, bitmap.height));
  const largura = Math.max(1, Math.round(bitmap.width * escala));
  const altura = Math.max(1, Math.round(bitmap.height * escala));
  const canvas = criarCanvas(largura, altura);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  const blob = await paraBlob(canvas, 'image/webp', qualidade);
  canvas.width = 0; canvas.height = 0; // libera a memória do canvas
  if (!blob || !blob.size) throw new ErroImagem('Não foi possível gerar a cópia reduzida da imagem.');
  return { blob, largura, altura, formato: 'webp' };
}

// Devolve { largura, altura, miniatura, trabalho }. largura/altura são as da imagem já com a
// orientação EXIF corrigida. Lança ErroImagem se o arquivo não puder ser decodificado.
export async function gerarDerivados(blob) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    throw new ErroImagem('O arquivo está corrompido ou não pôde ser lido como imagem.');
  }
  try {
    if (!bitmap.width || !bitmap.height) throw new ErroImagem('A imagem não tem dimensões válidas.');
    const miniatura = await reduzir(bitmap, IMPORTACAO.miniaturaLado, IMPORTACAO.miniaturaQualidade);
    const trabalho = await reduzir(bitmap, IMPORTACAO.trabalhoLado, IMPORTACAO.trabalhoQualidade);
    return { largura: bitmap.width, altura: bitmap.height, miniatura, trabalho };
  } finally {
    bitmap.close();
  }
}
