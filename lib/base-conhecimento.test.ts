import { describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BASE_CONHECIMENTO, selecionarConhecimento, conferirFatos } from './base-conhecimento.server';
import { INSTRUCOES, PROVIDERS } from './copywriting-config.server';
import { gerarCopy } from './copywriting.server';
import { obterFicha } from '../legacy/render/templates/index.js';
import { camposGeraveis, type Ficha } from '../legacy/ia/contrato.js';

const ficha = obterFicha('FOT-01') as Ficha & { padroes: () => Record<string, unknown> };
const campos = ficha.padroes();
const pedido = { templateId: 'FOT-01', formato: ficha.formatos[0]!, objetivo: 'Divulgar a Vila Privativa para grupos no Carnaval', inspiracao: '', observacaoImagens: '', campos };
const todas = { openrouter: 'o', cloudflareAccountId: 'conta', cloudflareToken: 'c' };

function resposta(texto: string) {
  const c: Record<string, unknown> = {};
  for (const d of camposGeraveis(ficha, campos)) c[d.id] = d.tipo === 'lista' || d.tipo === 'itens' ? [] : texto;
  return { campos: c };
}
const sseOpenAI = (obj: unknown) => new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: JSON.stringify(obj) }, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`);
const jsonCloudflare = (obj: unknown) => Response.json({ success: true, result: { response: JSON.stringify(obj) } });
const modelos = () => Response.json({ data: [{ id: PROVIDERS[0].model, pricing: { prompt: '0', completion: '0' }, supported_parameters: ['structured_outputs'] }] });

// Extrai (sistema, mensagem do usuário) do corpo de cada provedor, no formato de cada API.
function contexto(body: string) {
  const j = JSON.parse(body);
  return { sistema: j.messages.find((m: { role: string }) => m.role === 'system').content, usuario: j.messages.find((m: { role: string }) => m.role === 'user').content };
}

describe('base de conhecimento', () => {
  it('1. is loaded in full and the generation sections are selectable', () => {
    expect(BASE_CONHECIMENTO.map((s) => s.titulo.split('.')[0])).toEqual(Array.from({ length: 15 }, (_, i) => String(i + 1)));
    const tudo = selecionarConhecimento({ objetivo: 'vila loft casa praia preço carnaval site público institucional estrutura', templateId: 'FOT-01' });
    for (const fato of ['Confortável: 8 pessoas', 'Máxima: 11 pessoas', 'Praia a pé: aproximadamente 25 minutos', 'As toalhas de banho não estão incluídas', 'Estadia mínima: 2 noites', 'Quintal Butiá', '@cabanaslobodomar', 'Taxa para pets'])
      expect(tudo).toContain(fato);
    // Seções do futuro agente (painel, autonomia, campanhas) não orientam esta geração.
    expect(tudo).not.toContain('painel administrativo');
    expect(tudo).not.toContain('11.2. Escolha de fotografias');
  });

  it('2. selects only the modules relevant to the objective', () => {
    const vila = selecionarConhecimento({ objetivo: 'Divulgar a Vila Privativa para um grupo de amigos', templateId: 'FOT-01' });
    expect(vila).toContain('Vila Privativa');
    expect(vila).not.toContain('4.1. Loft 1 e Loft 2');
    expect(vila).not.toContain('Distâncias confirmadas');
    const loc = selecionarConhecimento({ objetivo: 'Mostrar a localização e as festas da região', templateId: 'FOT-01' });
    expect(loc).toContain('Distâncias confirmadas');
    expect(loc).not.toContain('Vila Privativa corresponde');
    const generica = selecionarConhecimento({ objetivo: 'Divulgar a hospedagem', templateId: 'FOT-01' });
    for (const trechoTxt of ['Identidade da empresa', 'Tom de voz', 'Regras inegociáveis', 'Loft 1 e Loft 2', 'Vila Privativa']) expect(generica).toContain(trechoTxt);
    // Identidade, tom e regras vão em toda geração.
    for (const fixo of ['Identidade da empresa', 'Tom de voz', 'Regras inegociáveis']) expect(vila).toContain(fixo);
  });

  it('3. commercial templates always include the commercial policy', () => {
    const com = selecionarConhecimento({ objetivo: 'Pacote de feriado', templateId: 'COM-01' });
    expect(com).toContain('Política comercial');
    expect(com).toContain('Sazonalidade');
  });

  it('4. the selected context stays well under the old full base', () => {
    const tudo = BASE_CONHECIMENTO.filter((s) => s.naGeracao).reduce((n, s) => n + s.texto.length, 0);
    const vila = selecionarConhecimento({ objetivo: 'Divulgar a Vila Privativa', templateId: 'FOT-01' });
    expect(vila.length).toBeLessThan(tudo * 0.7);
  });

  it('stays on the server: no browser module imports it', () => {
    const arquivos = (d: string): string[] => readdirSync(d).flatMap((f) => statSync(join(d, f)).isDirectory() ? arquivos(join(d, f)) : [join(d, f)]);
    for (const f of arquivos('src/legacy')) expect(readFileSync(f, 'utf8'), f).not.toMatch(/base-conhecimento|copywriting-config/);
  });

  it('5. OpenRouter and Cloudflare receive exactly the same context', async () => {
    const vistos: ReturnType<typeof contexto>[] = [];
    const fetcher = vi.fn(async (url: string, init: RequestInit) => {
      if (url.endsWith('/models')) return modelos();
      vistos.push(contexto(String(init.body)));
      return url.includes('openrouter') ? new Response('', { status: 429 }) : jsonCloudflare(resposta('Vila inteira para a turma'));
    });
    await gerarCopy(pedido, todas, new AbortController().signal, () => {}, fetcher as unknown as typeof fetch);
    expect(vistos).toHaveLength(2);
    expect(vistos[0]!.sistema).toBe(vistos[1]!.sistema);
    expect(vistos[0]!.usuario).toBe(vistos[1]!.usuario);
    expect(vistos[0]!.sistema).toContain(INSTRUCOES);
    expect(vistos[0]!.sistema).toContain('Vila Privativa');
    expect(vistos[0]!.usuario).toContain(pedido.objetivo);
  });

  it('6. checks generated texts against the real data', () => {
    const dados = `${pedido.objetivo}`;
    expect(conferirFatos({ titulo: 'Vila com piscina para a turma' }, dados)).toMatch(/comodidade/);
    expect(conferirFatos({ titulo: 'Wi-Fi rápido' }, dados)).toMatch(/comodidade/);
    expect(conferirFatos({ faq: [{ p: 'Tem ar-condicionado?', r: 'Tem sim, em todas' }] }, dados)).toMatch(/comodidade/);
    expect(conferirFatos({ faq: [{ p: 'Tem toalhas?', r: 'Não, as toalhas de banho não estão incluídas' }] }, dados)).toBeNull();
    expect(conferirFatos({ r: 'As toalhas de banho não estão incluídas' }, dados)).toBeNull();
    expect(conferirFatos({ titulo: 'Caminhe até a praia' }, dados)).toMatch(/praia/);
    expect(conferirFatos({ apoio: 'A praia fica a 10 minutos de carro' }, dados)).toBeNull();
    expect(conferirFatos({ apoio: 'Diárias a partir de R$ 450' }, dados)).toMatch(/valor/);
    expect(conferirFatos({ apoio: 'Vila a partir de R$ 700 em dias de semana' }, dados)).toBeNull();
    expect(conferirFatos({ apoio: 'Feriado por R$ 1.200' }, 'Divulgar feriado com diária de R$ 1.200')).toBeNull();
    expect(conferirFatos({ titulo: 'Até 11 pessoas na Vila Privativa' }, dados)).toBeNull();
  });

  it('7. an invented amenity sends the request to the fallback, which fills the fields', async () => {
    const chamadas: string[] = [];
    const fetcher = vi.fn(async (url: string) => {
      if (url.endsWith('/models')) return modelos();
      chamadas.push(url.includes('openrouter') ? 'openrouter' : 'cloudflare');
      return url.includes('openrouter') ? sseOpenAI(resposta('Vila com piscina')) : jsonCloudflare(resposta('Quintal e churrasqueira'));
    });
    const eventos: Record<string, unknown>[] = [];
    await gerarCopy(pedido, todas, new AbortController().signal, (e) => eventos.push(e), fetcher as unknown as typeof fetch);
    expect(chamadas).toEqual(['openrouter', 'cloudflare']);
    const r = eventos.find((e) => e['tipo'] === 'resultado')!;
    expect(r['provedor']).toBe('Cloudflare Workers AI');
    expect(Object.keys(r['campos'] as object).sort()).toEqual(camposGeraveis(ficha, campos).map((d) => d.id).sort());
    expect(Object.values(r['campos'] as object)).toContain('Quintal e churrasqueira');
  });
});
