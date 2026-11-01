// Identificação do formato pelos primeiros bytes (não pela extensão) e leitura da orientação EXIF.

export class ErroImagem extends Error {
  constructor(mensagem) { super(mensagem); this.name = 'ErroImagem'; }
}

const ascii = (b, i, s) => [...s].every((ch, k) => b[i + k] === ch.charCodeAt(0));

// Devolve { formato, mime, rotulo }. Lança ErroImagem com texto pronto para o usuário.
export async function detectarFormato(blob) {
  if (!blob.size) throw new ErroImagem('O arquivo está vazio.');
  const b = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { formato: 'jpeg', mime: 'image/jpeg', rotulo: 'JPEG' };
  if (b[0] === 0x89 && ascii(b, 1, 'PNG') && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) {
    return { formato: 'png', mime: 'image/png', rotulo: 'PNG' };
  }
  if (ascii(b, 0, 'RIFF') && ascii(b, 8, 'WEBP')) return { formato: 'webp', mime: 'image/webp', rotulo: 'WebP' };
  if (ascii(b, 4, 'ftyp') && (ascii(b, 8, 'hei') || ascii(b, 8, 'mif1') || ascii(b, 8, 'msf1') || ascii(b, 8, 'hev'))) {
    throw new ErroImagem('Formato HEIC/HEIF não é aceito. Converta a fotografia para JPG ou PNG e importe de novo.');
  }
  if (ascii(b, 0, 'GIF8')) throw new ErroImagem('GIF não é aceito. Use JPG, PNG ou WebP.');
  throw new ErroImagem('Formato não reconhecido como imagem. Use JPG, PNG ou WebP (converta outros formatos antes de importar).');
}

// Orientação EXIF (1 a 8) de um JPEG; 1 quando ausente ou ilegível.
export async function lerOrientacaoExif(blob) {
  const b = new Uint8Array(await blob.slice(0, 131072).arrayBuffer());
  let p = 2;
  while (p + 4 <= b.length && b[p] === 0xff) {
    const marcador = b[p + 1];
    if (marcador === 0xda || marcador === 0xd9) break;
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd7) || marcador === 0xff) { p += marcador === 0xff ? 1 : 2; continue; }
    const tam = (b[p + 2] << 8) | b[p + 3];
    if (marcador === 0xe1 && tam >= 16 && ascii(b, p + 4, 'Exif') && b[p + 8] === 0 && b[p + 9] === 0) {
      const t = p + 10;
      const le = b[t] === 0x49;
      const l16 = (o) => (le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
      const l32 = (o) => (le ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0
        : ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0);
      if (l16(t + 2) !== 42) return 1;
      const ifd = t + l32(t + 4);
      if (ifd + 2 > b.length) return 1;
      const n = l16(ifd);
      for (let i = 0; i < n; i++) {
        const e = ifd + 2 + i * 12;
        if (e + 12 > b.length) break;
        if (l16(e) === 0x0112) { const v = l16(e + 8); return v >= 1 && v <= 8 ? v : 1; }
      }
      return 1;
    }
    p += 2 + tam;
  }
  return 1;
}
