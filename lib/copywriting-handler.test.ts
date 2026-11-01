import { describe, expect, it, vi, afterEach } from 'vitest';
import { tratarCopywriting } from './copywriting-handler.server';
import { gerarCopy } from './copywriting.server';
import { obterFicha } from '../legacy/render/templates/index.js';
import { camposGeraveis, type Ficha } from '../legacy/ia/contrato.js';

const ORIGEM = 'https://mare.netlify.app';
const ficha = obterFicha('FOT-01') as Ficha & { padroes: () => Record<string, unknown> };
const campos = ficha.padroes();
const pedido = { templateId: 'FOT-01', formato: ficha.formatos[0]!, objetivo: 'Divulgar a cabana', inspiracao: '', observacaoImagens: '', campos };

function respostaValida() {
  const c: Record<string, unknown> = {};
  for (const d of camposGeraveis(ficha, campos)) c[d.id] = d.tipo === 'lista' || d.tipo === 'itens' ? [] : 'Texto curto';
  return { campos: c };
}
const sseOpenAI = (obj: unknown) => new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: JSON.stringify(obj) }, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`, { status: 200 });
const req = (origin: string | null, body = pedido) => new Request(`${ORIGEM}/api/copywriting`, { method: 'POST', headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) }, body: JSON.stringify(body) });

afterEach(() => vi.unstubAllGlobals());

describe('copywriting endpoint', () => {
  it('rejects requests from unauthorized origins', async () => {
    const r = await tratarCopywriting(req('https://outro-site.com'), { keys: { openrouter: 'k' } });
    expect(r.status).toBe(403);
  });

  it('answers CORS preflight only for an allowed origin', async () => {
    const r = await tratarCopywriting(new Request(`https://fn.netlify.app/api/copywriting`, { method: 'OPTIONS', headers: { origin: ORIGEM } }), { keys: {}, origensPermitidas: [ORIGEM] });
    expect(r.status).toBe(204);
    expect(r.headers.get('access-control-allow-origin')).toBe(ORIGEM);
  });

  it('never echoes provider keys to the browser', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('erro com chave-secreta-123', { status: 500 })));
    const r = await tratarCopywriting(req(ORIGEM), { keys: { openrouter: 'chave-secreta-123' } });
    const txt = await r.text();
    expect(txt).not.toContain('chave-secreta-123');
  });

  it('rejects a request that still carries photographs', async () => {
    const r = await tratarCopywriting(req(ORIGEM, { ...pedido, fotos: [{ mime: 'image/jpeg', data: 'AAAA' }] } as typeof pedido), { keys: { openrouter: 'k' } });
    expect(r.status).toBe(422);
    expect(await r.json()).toMatchObject({ mensagem: expect.stringMatching(/Fotografias não fazem parte/) });
  });
});

describe('provider order and fallback', () => {
  it('uses OpenRouter first and returns validated fields', async () => {
    const fetcher = vi.fn(async (url: string) => url.endsWith('/models')
      ? Response.json({ data: [{ id: 'nvidia/nemotron-3.5-super-vl:free', pricing: { prompt: '0', completion: '0' }, supported_parameters: ['structured_outputs'] }] })
      : sseOpenAI(respostaValida()));
    const eventos: Record<string, unknown>[] = [];
    await gerarCopy(pedido, { openrouter: 'o', cloudflareAccountId: 'c', cloudflareToken: 't' }, new AbortController().signal, (e) => eventos.push(e), fetcher as unknown as typeof fetch);
    expect(String((fetcher.mock.calls[1] as unknown[])[0])).toContain('openrouter.ai');
    expect(eventos.find((e) => e['tipo'] === 'resultado')?.['provedor']).toBe('OpenRouter');
  });

  it('skips providers whose key is missing instead of calling them', async () => {
    const fetcher = vi.fn();
    await expect(gerarCopy(pedido, {}, new AbortController().signal, () => {}, fetcher as unknown as typeof fetch)).rejects.toThrow(/Nenhum provedor conseguiu/);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
