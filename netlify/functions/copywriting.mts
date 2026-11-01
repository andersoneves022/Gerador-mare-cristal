// Netlify Function: geração de textos com IA (OpenRouter → Cloudflare Workers AI).
// Chaves configuradas em Netlify → Site configuration → Environment variables.
import { tratarCopywriting, lerOrigens } from '../../lib/copywriting-handler.server';

declare const Netlify: { env: { get(nome: string): string | undefined } } | undefined;

const env = (nome: string) =>
  (typeof Netlify !== 'undefined' ? Netlify.env.get(nome) : undefined) ?? process.env[nome];

export default async (request: Request) =>
  tratarCopywriting(request, {
    keys: {
      openrouter: env('OPENROUTER_API_KEY'),
      cloudflareAccountId: env('CLOUDFLARE_ACCOUNT_ID'),
      cloudflareToken: env('CLOUDFLARE_API_TOKEN'),
    },
    // URL e DEPLOY_PRIME_URL são definidas pelo Netlify; ALLOWED_ORIGINS acrescenta domínios próprios.
    origensPermitidas: lerOrigens([env('URL'), env('DEPLOY_PRIME_URL'), env('ALLOWED_ORIGINS')].filter(Boolean).join(',')),
  });

export const config = { path: '/api/copywriting' };
