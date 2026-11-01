import { describe, expect, it } from 'vitest';
import { gerarCopy, podeFallback } from './copywriting.server';
import { ErroCopy } from '../legacy/ia/contrato.js';

describe('copywriting server boundary', () => {
  it('rejects incomplete requests before contacting a provider', async () => {
    const fetcher = vi.fn();
    await expect(gerarCopy({} as Parameters<typeof gerarCopy>[0], {}, new AbortController().signal, vi.fn(), fetcher)).rejects.toBeInstanceOf(ErroCopy);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('falls back on provider HTTP failures but not on local or cancelled requests', () => {
    for (const status of [400, 401, 402, 403, 404, 408, 429, 500, 503]) expect(podeFallback(status)).toBe(true);
    for (const status of [422, 499]) expect(podeFallback(status)).toBe(false);
  });
});