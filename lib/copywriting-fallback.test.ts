import { describe, expect, it, vi } from 'vitest';
import { gerarCopy } from './copywriting.server';
import { PROVIDERS } from './copywriting-config.server';
import { obterFicha } from '../legacy/render/templates/index.js';
import { camposGeraveis, ErroCopy, type Ficha } from '../legacy/ia/contrato.js';

const ficha = obterFicha('FOT-01') as Ficha & { padroes: () => Record<string, unknown> };
const campos = ficha.padroes();
const pedido = { templateId: 'FOT-01', formato: ficha.formatos[0]!, objetivo: 'Divulgar a cabana', inspiracao: '', observacaoImagens: '', campos };
const todas = { openrouter: 'o', cloudflareAccountId: 'conta', cloudflareToken: 'c' };

function respostaValida(texto = 'Texto curto') {
  const c: Record<string, unknown> = {};
  for (const d of camposGeraveis(ficha, campos)) c[d.id] = d.tipo === 'lista' || d.tipo === 'itens' ? [] : texto;
  return { campos: c };
}
const sseOpenAI = (obj: unknown) => new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: JSON.stringify(obj) }, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`, { status: 200 });
const jsonCloudflare = (obj: unknown) => Response.json({ success: true, result: { response: JSON.stringify(obj) } });
const modelosOpenRouter = () => Response.json({ data: [{ id: PROVIDERS[0].model, pricing: { prompt: '0', completion: '0' }, supported_parameters: ['structured_outputs'] }] });

type Rota = 'openrouter' | 'cloudflare';
const rota = (url: string): Rota | 'modelos' => url.endsWith('/models') ? 'modelos' : url.includes('openrouter') ? 'openrouter' : 'cloudflare';

// Simula cada provedor; registra quantas vezes cada um foi chamado.
function simular(resp: Partial<Record<Rota, () => Response>>) {
  const chamadas: Rota[] = [];
  const fetcher = vi.fn(async (url: string) => {
    const r = rota(url);
    if (r === 'modelos') return modelosOpenRouter();
    chamadas.push(r);
    return resp[r]!();
  });
  return { fetcher: fetcher as unknown as typeof fetch, chamadas, raw: fetcher };
}
async function gerar(keys: Record<string, string>, fetcher: typeof fetch) {
  const eventos: Record<string, unknown>[] = [];
  await gerarCopy(pedido, keys, new AbortController().signal, (e) => eventos.push(e), fetcher);
  return eventos;
}
const resultado = (ev: Record<string, unknown>[]) => ev.find((e) => e['tipo'] === 'resultado')!;

describe('fallback OpenRouter → Cloudflare Workers AI', () => {
  it('1. OpenRouter working: Cloudflare is not called', async () => {
    const s = simular({ openrouter: () => sseOpenAI(respostaValida()) });
    const ev = await gerar(todas, s.fetcher);
    expect(s.chamadas).toEqual(['openrouter']);
    expect(resultado(ev)).toMatchObject({ provedor: 'OpenRouter', fallback: false });
  });

  it('2. OpenRouter with invalid key (401): tries Cloudflare', async () => {
    const s = simular({ openrouter: () => new Response('', { status: 401 }), cloudflare: () => jsonCloudflare(respostaValida()) });
    const ev = await gerar(todas, s.fetcher);
    expect(s.chamadas).toEqual(['openrouter', 'cloudflare']);
    expect(resultado(ev)).toMatchObject({ provedor: 'Cloudflare Workers AI', fallback: true });
    expect(ev).toContainEqual({ tipo: 'provedor', provedor: 'Cloudflare Workers AI', anterior: 'OpenRouter' });
  });

  it('3. OpenRouter with unauthorized/missing model (403, 404, 400): tries Cloudflare', async () => {
    for (const status of [403, 404, 400]) {
      const s = simular({ openrouter: () => new Response('', { status }), cloudflare: () => jsonCloudflare(respostaValida()) });
      await gerar(todas, s.fetcher);
      expect(s.chamadas).toEqual(['openrouter', 'cloudflare']);
    }
  });

  it('4. invalid structured response, 5xx and network errors also fall back; one attempt each', async () => {
    const s = simular({ openrouter: () => sseOpenAI({ outra: 1 }), cloudflare: () => jsonCloudflare(respostaValida()) });
    await gerar(todas, s.fetcher);
    expect(s.chamadas).toEqual(['openrouter', 'cloudflare']);
    const t = simular({ openrouter: () => { throw new TypeError('rede'); }, cloudflare: () => jsonCloudflare(respostaValida()) });
    await gerar(todas, t.fetcher);
    expect(t.chamadas).toEqual(['openrouter', 'cloudflare']);
  });

  it('5. Cloudflare without credentials: skipped, clear error', async () => {
    const s = simular({ openrouter: () => new Response('', { status: 429 }) });
    const erro = await gerarCopy(pedido, { openrouter: 'o' }, new AbortController().signal, () => {}, s.fetcher).catch((e) => e);
    expect(erro).toBeInstanceOf(ErroCopy);
    expect(erro.message).toMatch(/Cloudflare Workers AI: sem chave configurada/);
    expect(s.chamadas).toEqual(['openrouter']);
  });

  it('6. both failing: understandable error with reasons and no secrets', async () => {
    const s = simular({ openrouter: () => new Response('chave-secreta', { status: 401 }), cloudflare: () => new Response('', { status: 429 }) });
    const erro = await gerarCopy(pedido, todas, new AbortController().signal, () => {}, s.fetcher).catch((e) => e);
    expect(erro).toBeInstanceOf(ErroCopy);
    expect(erro.message).toMatch(/Nenhum provedor conseguiu gerar o texto/);
    expect(erro.message).toMatch(/OpenRouter: .*não autorizou/);
    expect(erro.message).toMatch(/Cloudflare Workers AI: .*cota gratuita/);
    expect(erro.message).not.toContain('chave-secreta');
    expect(s.chamadas).toEqual(['openrouter', 'cloudflare']);
  });

  it('7. fallback working: fills the real editor fields', async () => {
    const s = simular({ openrouter: () => new Response('', { status: 404 }), cloudflare: () => jsonCloudflare(respostaValida('Cabana no verde')) });
    const ev = await gerar(todas, s.fetcher);
    const gerados = resultado(ev)['campos'] as Record<string, unknown>;
    expect(Object.keys(gerados).sort()).toEqual(camposGeraveis(ficha, campos).map((d) => d.id).sort());
    expect(Object.values(gerados).filter((v) => typeof v === 'string')).toContain('Cabana no verde');
  });

  it('8. local validation errors: no provider is called', async () => {
    const s = simular({});
    for (const p of [{ ...pedido, objetivo: '' }, { ...pedido, formato: 'xx' }, { ...pedido, observacaoImagens: 'x'.repeat(501) }, { ...pedido, fotos: [{ mime: 'image/jpeg', data: 'AAAA' }] }])
      await expect(gerarCopy(p as typeof pedido, todas, new AbortController().signal, () => {}, s.fetcher)).rejects.toBeInstanceOf(ErroCopy);
    expect(s.raw).not.toHaveBeenCalled();
  });

  it('9. no photograph or image data is sent to any provider', async () => {
    const corpos: string[] = [];
    const fetcher = vi.fn(async (url: string, init: RequestInit) => {
      if (url.endsWith('/models')) return modelosOpenRouter();
      corpos.push(String(init.body));
      return url.includes('openrouter') ? new Response('', { status: 500 }) : jsonCloudflare(respostaValida());
    });
    await gerar(todas, fetcher as unknown as typeof fetch);
    expect(corpos).toHaveLength(2);
    for (const c of corpos) {
      expect(c).not.toMatch(/image_url|inlineData|base64|data:image/);
      expect(c).not.toContain('AAAA');
    }
  });

  it('content safety refusal stops without trying other providers', async () => {
    const s = simular({ openrouter: () => new Response(`data: ${JSON.stringify({ choices: [{ delta: { refusal: 'recusado' } }] })}\n\n`) });
    await expect(gerar(todas, s.fetcher)).rejects.toMatchObject({ codigo: 'recusa' });
    expect(s.chamadas).toEqual(['openrouter']);
  });
});

describe('timeout', () => {
  it('a hanging provider times out and the next one is tried', async () => {
    vi.useFakeTimers();
    try {
      const chamadas: string[] = [];
      const fetcher = (async (url: string, init: RequestInit) => {
        if (url.endsWith('/models')) return modelosOpenRouter();
        chamadas.push(rota(url));
        if (rota(url) === 'openrouter') return new Promise((_, rej) => init.signal!.addEventListener('abort', () => rej(new DOMException('t', 'TimeoutError'))));
        return jsonCloudflare(respostaValida());
      }) as unknown as typeof fetch;
      const p = gerarCopy(pedido, todas, new AbortController().signal, () => {}, fetcher);
      await vi.advanceTimersByTimeAsync(26_000);
      await p;
      expect(chamadas).toEqual(['openrouter', 'cloudflare']);
    } finally { vi.useRealTimers(); }
  });
});
