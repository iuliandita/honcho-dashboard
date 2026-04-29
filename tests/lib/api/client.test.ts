import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../../src/lib/api/client';
import { HonchoApiError } from '../../../src/lib/api/errors';

describe('createApiClient', () => {
  it('GETs against the proxy base path', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      expect(url).toBe('/api/peers/abc');
      return new Response(JSON.stringify({ id: 'abc' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const api = createApiClient({ fetch: fetchMock });
    const data = await api.get<{ id: string }>('/peers/abc');

    expect(data).toEqual({ id: 'abc' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('POSTs with JSON body', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe('{"query":"hi"}');
      expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json');
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const api = createApiClient({ fetch: fetchMock });
    await api.post('/peers/abc/chat', { query: 'hi' });

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('omits the body when POST receives null', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.body).toBeUndefined();
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const api = createApiClient({ fetch: fetchMock });
    await api.post('/empty', null);

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('throws HonchoApiError on non-2xx', async () => {
    const fetchMock = async () =>
      new Response(
        JSON.stringify({
          error: 'not found',
          status: 404,
          traceId: 't-1',
          upstream: 'honcho',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );

    const api = createApiClient({ fetch: fetchMock });

    await expect(api.get('/missing')).rejects.toBeInstanceOf(HonchoApiError);
    await expect(api.get('/missing')).rejects.toMatchObject({
      status: 404,
      traceId: 't-1',
      upstream: 'honcho',
    });
  });

  it('preserves query string', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      expect(url).toBe('/api/sessions/xyz/messages?cursor=abc&limit=50');
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    const api = createApiClient({ fetch: fetchMock });
    await api.get('/sessions/xyz/messages', { cursor: 'abc', limit: 50 });

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('forwards abort signals to fetch', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.signal).toBe(controller.signal);
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    const api = createApiClient({ fetch: fetchMock });
    await api.post('/peers/abc/chat', { query: 'hi' }, undefined, { signal: controller.signal });

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
