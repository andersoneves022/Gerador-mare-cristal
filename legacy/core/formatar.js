const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
export function formatarBytes(n) {
  if (!Number.isFinite(n)) return '—';
  const un = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1024 && i < un.length - 1) { n /= 1024; i++; }
  return `${num.format(n)} ${un[i]}`;
}
export const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
