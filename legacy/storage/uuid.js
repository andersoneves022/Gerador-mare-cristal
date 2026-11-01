// UUID v4. Usa crypto.randomUUID quando existe; senão, getRandomValues.
export function novoId() {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const x = [...b].map((n) => n.toString(16).padStart(2, '0'));
  return `${x.slice(0, 4).join('')}-${x.slice(4, 6).join('')}-${x.slice(6, 8).join('')}-${x.slice(8, 10).join('')}-${x.slice(10).join('')}`;
}

export const ehUuid = (s) =>
  typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
