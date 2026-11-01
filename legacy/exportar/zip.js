// ZIP sem compressão (STORE), montado a partir de Blobs, um arquivo por vez.
// Cada imagem é lida só uma vez (para o CRC-32) e liberada; o ZIP final é um Blob composto
// por partes, que o navegador pode manter fora da memória do script. Imagens PNG/JPEG já são
// comprimidas, então STORE não perde tamanho relevante.
const TABELA = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
export function crc32(bytes, crc = 0) {
  let c = ~crc >>> 0;
  for (let i = 0; i < bytes.length; i++) c = TABELA[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

function dataDos(d) {
  const hora = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const data = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { hora, data };
}

const enc = new TextEncoder();
export function criarZip() {
  const partes = [], central = [];
  const nomes = new Set();
  let deslocamento = 0;
  const { hora, data } = dataDos(new Date());

  // Garante nomes únicos dentro do ZIP: "x.png", "x-2.png", "x-3.png"...
  function nomeLivre(nome) {
    if (!nomes.has(nome)) { nomes.add(nome); return nome; }
    const i = nome.lastIndexOf('.'), base = i > 0 ? nome.slice(0, i) : nome, ext = i > 0 ? nome.slice(i) : '';
    for (let n = 2; ; n++) { const x = `${base}-${n}${ext}`; if (!nomes.has(x)) { nomes.add(x); return x; } }
  }

  async function adicionar(nomeDesejado, blob) {
    const nome = nomeLivre(nomeDesejado);
    const nb = enc.encode(nome);
    const crc = crc32(new Uint8Array(await blob.arrayBuffer())); // buffer descartado logo depois
    const tam = blob.size;
    const loc = new DataView(new ArrayBuffer(30));
    loc.setUint32(0, 0x04034b50, true); loc.setUint16(4, 20, true); loc.setUint16(6, 0x0800, true); // UTF-8
    loc.setUint16(8, 0, true); loc.setUint16(10, hora, true); loc.setUint16(12, data, true);
    loc.setUint32(14, crc, true); loc.setUint32(18, tam, true); loc.setUint32(22, tam, true);
    loc.setUint16(26, nb.length, true); loc.setUint16(28, 0, true);
    partes.push(loc.buffer, nb, blob);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true); cen.setUint16(12, hora, true); cen.setUint16(14, data, true);
    cen.setUint32(16, crc, true); cen.setUint32(20, tam, true); cen.setUint32(24, tam, true);
    cen.setUint16(28, nb.length, true); cen.setUint32(42, deslocamento, true);
    central.push(cen.buffer, nb);
    deslocamento += 30 + nb.length + tam;
    return nome;
  }

  function finalizar() {
    const tamCentral = central.reduce((s, p) => s + p.byteLength, 0);
    const fim = new DataView(new ArrayBuffer(22));
    fim.setUint32(0, 0x06054b50, true);
    fim.setUint16(8, nomes.size, true); fim.setUint16(10, nomes.size, true);
    fim.setUint32(12, tamCentral, true); fim.setUint32(16, deslocamento, true);
    return new Blob([...partes, ...central, fim.buffer], { type: 'application/zip' });
  }

  return { adicionar, finalizar, get quantidade() { return nomes.size; } };
}
