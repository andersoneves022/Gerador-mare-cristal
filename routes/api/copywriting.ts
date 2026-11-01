import { createFileRoute } from '@tanstack/react-router';

// Mesma lógica da Netlify Function (netlify/functions/copywriting.mts); aqui serve a prévia.
async function tratar(request: Request) {
  const { tratarCopywriting, lerOrigens } = await import('../../lib/copywriting-handler.server');
  // Secrets lidos exclusivamente dentro do handler, nunca em módulos isomórficos.
  return tratarCopywriting(request, {
    keys: {
      openrouter: process.env['OPENROUTER_API_KEY'],
      cloudflareAccountId: process.env['CLOUDFLARE_ACCOUNT_ID'],
      cloudflareToken: process.env['CLOUDFLARE_API_TOKEN'],
    },
    origensPermitidas: lerOrigens(process.env['ALLOWED_ORIGINS']),
  });
}

export const Route = createFileRoute('/api/copywriting')({
  server: { handlers: { POST: ({ request }) => tratar(request), OPTIONS: ({ request }) => tratar(request) } },
});
