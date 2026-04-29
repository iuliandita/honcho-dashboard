import { describe, expect, it } from 'vitest';
import { fetchRuntimeConfig, workspaceMode } from '../../../src/lib/runtime-config';

describe('fetchRuntimeConfig', () => {
  it('fetches and returns the runtime config payload', async () => {
    const fetchMock = async (url: RequestInfo | URL) => {
      expect(typeof url === 'string' ? url : url.toString()).toBe('/api/runtime-config');
      return new Response(JSON.stringify({ workspaceId: 'ws-abc', version: '0.1.0' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const config = await fetchRuntimeConfig({ fetch: fetchMock });

    expect(config).toEqual({ workspaceId: 'ws-abc', version: '0.1.0' });
  });

  it('returns null workspaceId when env unset', async () => {
    const fetchMock = async () =>
      new Response(JSON.stringify({ workspaceId: null, version: '0.1.0' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    const config = await fetchRuntimeConfig({ fetch: fetchMock });

    expect(config.workspaceId).toBeNull();
  });

  it('throws on non-200 response', async () => {
    const fetchMock = async () =>
      new Response(JSON.stringify({ error: 'down', status: 500, upstream: 'proxy' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });

    await expect(fetchRuntimeConfig({ fetch: fetchMock })).rejects.toThrow();
  });

  it('preserves trace context on non-200 response', async () => {
    const fetchMock = async () =>
      new Response(JSON.stringify({ error: 'down', status: 500, upstream: 'proxy', traceId: 'trace-runtime' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });

    await expect(fetchRuntimeConfig({ fetch: fetchMock })).rejects.toMatchObject({
      status: 500,
      traceId: 'trace-runtime',
      upstream: 'proxy',
    });
  });
});

describe('workspaceMode', () => {
  it('returns "pinned" when workspaceId present', () => {
    expect(workspaceMode({ workspaceId: 'ws-abc', version: '0.1.0' })).toBe('pinned');
  });

  it('returns "picker" when workspaceId null', () => {
    expect(workspaceMode({ workspaceId: null, version: '0.1.0' })).toBe('picker');
  });
});
