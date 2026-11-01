// Tratamento HTTP da geração de textos, comum à prévia (rota /api/copywriting) e à Netlify Function.
// Não depende de nenhum backend externo; apenas chama os provedores de IA com chaves do servidor.
import { verificarPedido, ErroCopy } from '../legacy/ia/contrato.js';
import { gerarCopy, type Keys, type Pedido } from './copywriting.server';

export type OpcoesHandler = { keys: Keys; origensPermitidas?: string[] };

const LIMITE_CORPO = 120_000;

function origemAutorizada(request: Request, extras: string[]) {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  const propria = new URL(request.url).origin;
  return origin === propria || extras.includes(origin) ? origin : null;
}

function cabecalhosCors(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

export async function tratarCopywriting(request: Request, { keys, origensPermitidas = [] }: OpcoesHandler): Promise<Response> {
  const origin = origemAutorizada(request, origensPermitidas);
  if (!origin) return Response.json({ mensagem: 'Solicitação não autorizada.' }, { status: 403 });
  const cors = cabecalhosCors(origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return Response.json({ mensagem: 'Método não permitido.' }, { status: 405, headers: cors });
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return Response.json({ mensagem: 'Solicitação inválida.' }, { status: 415, headers: cors });

  let p: Pedido;
  try {
    const raw = await request.text();
    if (raw.length > LIMITE_CORPO) return Response.json({ mensagem: 'A solicitação ultrapassa o tamanho permitido.' }, { status: 413, headers: cors });
    p = JSON.parse(raw);
    verificarPedido(p);
  } catch (e) {
    return Response.json({ mensagem: e instanceof ErroCopy ? e.message : 'Solicitação inválida.' }, { status: 422, headers: cors });
  }

  const controller = new AbortController();
  request.signal?.addEventListener('abort', () => controller.abort(), { once: true });
  const encoder = new TextEncoder();
  // Nenhuma fotografia é recebida ou enviada aos provedores; nada é gravado no servidor.
  const body = new ReadableStream({
    start(stream) {
      const emit = (event: Record<string, unknown>) => { if (!controller.signal.aborted) stream.enqueue(encoder.encode(JSON.stringify(event) + '\n')); };
      void gerarCopy(p, keys, controller.signal, emit)
        .catch((e) => {
          emit({ tipo: 'erro', mensagem: e instanceof ErroCopy ? e.message : 'Não foi possível concluir a geração. Os seus dados foram preservados.', codigo: e instanceof ErroCopy ? e.codigo : 'indisponivel' });
        })
        .finally(() => { if (!controller.signal.aborted) stream.close(); });
    },
    cancel() { controller.abort(); },
  });
  return new Response(body, { headers: { ...cors, 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store, no-transform', 'X-Content-Type-Options': 'nosniff' } });
}

export const lerOrigens = (valor: string | undefined) => (valor ?? '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
