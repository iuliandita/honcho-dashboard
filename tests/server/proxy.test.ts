import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { proxyRoute } from '../../src/server/proxy';
import { createStubHoncho } from './stub-honcho';

describe('proxy /api/*', () => {
  it('forwards POST to Honcho with bearer header injected', async () => {
    const stub = createStubHoncho();
    const honchoFetch = (req: Request) => stub.app.fetch(req);

    const app = new Hono();
    app.route(
      '/',
      proxyRoute({
        apiBase: 'http://stub.local',
        adminToken: 'test-token-123',
        timeoutMs: 1000,
        fetch: honchoFetch,
      }),
    );

    const res = await app.request('/api/v3/workspaces/ws/peers/abc/representation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_conclusions: null }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ representation: '' });
    expect(stub.requests).toHaveLength(1);
    expect(stub.requests[0]?.authorization).toBe('Bearer test-token-123');
    expect(stub.requests[0]?.path).toBe('/v3/workspaces/ws/peers/abc/representation');
  });

  it('forwards POST body and preserves SSE response', async () => {
    const stub = createStubHoncho();
    const honchoFetch = (req: Request) => stub.app.fetch(req);

    const app = new Hono();
    app.route(
      '/',
      proxyRoute({
        apiBase: 'http://stub.local',
        adminToken: 'test-token',
        timeoutMs: 1000,
        fetch: honchoFetch,
      }),
    );

    const res = await app.request('/api/v3/workspaces/ws/peers/abc/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'hi', stream: true, reasoning_level: 'low' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    const body = await res.text();
    expect(body).toContain('"type":"token"');
    expect(body).toContain('"type":"done"');
    expect(stub.requests[0]?.body).toBe('{"query":"hi","stream":true,"reasoning_level":"low"}');
  });

  it('returns 502 with traceId when upstream is unreachable', async () => {
    const failingFetch = () => Promise.reject(new Error('ECONNREFUSED'));

    const app = new Hono();
    app.route(
      '/',
      proxyRoute({
        apiBase: 'http://nowhere.invalid',
        adminToken: 'test-token',
        timeoutMs: 1000,
        fetch: failingFetch,
      }),
    );

    const res = await app.request('/api/peers/abc');

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body).toMatchObject({
      error: expect.any(String),
      status: 502,
      upstream: 'proxy',
      traceId: expect.any(String),
    });
    expect(body.detail).toBeUndefined();
    expect(res.headers.get('X-Trace-Id')).toBe(body.traceId);
  });

  it('forwards Honcho 4xx with status preserved and traceId added', async () => {
    const stub = createStubHoncho();
    const honchoFetch = (req: Request) => stub.app.fetch(req);

    const app = new Hono();
    app.route(
      '/',
      proxyRoute({
        apiBase: 'http://stub.local',
        adminToken: 'test-token',
        timeoutMs: 1000,
        fetch: honchoFetch,
      }),
    );

    const res = await app.request('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.headers.get('X-Trace-Id')).toBeTruthy();
  });
});
