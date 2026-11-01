// SHA-256 incremental (FIPS 180-4), em JavaScript puro.
// crypto.subtle.digest() exige o arquivo inteiro na memória; aqui o arquivo é lido em partes
// e a memória usada não depende do tamanho do arquivo.
import { IMPORTACAO } from '../config.js';

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const rotd = (x, n) => (x >>> n) | (x << (32 - n));

export function criarSha256() {
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  const bloco = new Uint8Array(64);
  let usado = 0;
  let total = 0;
  let finalizado = false;

  function processar(b, o) {
    for (let i = 0; i < 16; i++, o += 4) W[i] = (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3];
    for (let i = 16; i < 64; i++) {
      const x = W[i - 15], y = W[i - 2];
      const s0 = rotd(x, 7) ^ rotd(x, 18) ^ (x >>> 3);
      const s1 = rotd(y, 17) ^ rotd(y, 19) ^ (y >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    let a = H[0], b2 = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rotd(e, 6) ^ rotd(e, 11) ^ rotd(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + W[i]) | 0;
      const S0 = rotd(a, 2) ^ rotd(a, 13) ^ rotd(a, 22);
      const maj = (a & b2) ^ (a & c) ^ (b2 & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b2; b2 = a; a = (t1 + t2) | 0;
    }
    H[0] += a; H[1] += b2; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }

  return {
    atualizar(dados) {
      if (finalizado) throw new Error('SHA-256 já finalizado');
      let i = 0;
      const n = dados.length;
      total += n;
      if (usado > 0) {
        const falta = Math.min(64 - usado, n);
        bloco.set(dados.subarray(0, falta), usado);
        usado += falta; i = falta;
        if (usado === 64) { processar(bloco, 0); usado = 0; }
      }
      for (; i + 64 <= n; i += 64) processar(dados, i);
      if (i < n) { bloco.set(dados.subarray(i), 0); usado = n - i; }
      return this;
    },
    finalizar() {
      if (finalizado) throw new Error('SHA-256 já finalizado');
      finalizado = true;
      const bits = total * 8;
      bloco[usado++] = 0x80;
      if (usado > 56) { bloco.fill(0, usado); processar(bloco, 0); usado = 0; }
      bloco.fill(0, usado, 56);
      const dv = new DataView(bloco.buffer);
      dv.setUint32(56, Math.floor(bits / 4294967296));
      dv.setUint32(60, bits >>> 0);
      processar(bloco, 0);
      return [...H].map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
    },
  };
}

export function sha256Bytes(bytes) {
  return criarSha256().atualizar(bytes).finalizar();
}

// Calcula o SHA-256 de um Blob/File lendo uma parte por vez.
export async function sha256Blob(blob, { parte = IMPORTACAO.parteHashBytes, aoProgresso } = {}) {
  const h = criarSha256();
  for (let pos = 0; pos < blob.size; pos += parte) {
    const buf = await blob.slice(pos, Math.min(pos + parte, blob.size)).arrayBuffer();
    h.atualizar(new Uint8Array(buf));
    aoProgresso?.(Math.min(pos + parte, blob.size) / blob.size);
  }
  return h.finalizar();
}
