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

  it('returns 504 with traceId when upstream times out', async () => {
    const timeoutFetch = () => Promise.reject(new DOMException('TimeoutError', 'TimeoutError'));

    const app = new Hono();
    app.route(
      '/',
      proxyRoute({
        apiBase: 'http://slow.invalid',
        adminToken: 'test-token',
        timeoutMs: 1,
        fetch: timeoutFetch,
      }),
    );

    const res = await app.request('/api/slow');

    expect(res.status).toBe(504);
    const body = await res.json();
    expect(body).toMatchObject({
      error: 'upstream timeout',
      status: 504,
      upstream: 'proxy',
      traceId: expect.any(String),
    });
    expect(res.headers.get('X-Trace-Id')).toBe(body.traceId);
  });

  it('passes through SSE chunks when upstream closes mid-stream', async () => {
    const enc = new TextEncoder();
    const streamingFetch = () =>
      Promise.resolve(
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(enc.encode('data: {"type":"token","data":"partial"}\n\n'));
              controller.close();
            },
          }),
          { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
        ),
      );

    const app = new Hono();
    app.route(
      '/',
      proxyRoute({
        apiBase: 'http://stub.local',
        adminToken: 'test-token',
        timeoutMs: 1000,
        fetch: streamingFetch,
      }),
    );

    const res = await app.request('/api/v3/workspaces/ws/peers/abc/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'hi', stream: true }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    expect(await res.text()).toBe('data: {"type":"token","data":"partial"}\n\n');
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

  it('drops upstream encoding headers when fetch has decoded the body', async () => {
    const encodedFetch = () =>
      Promise.resolve(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: {
            'Content-Encoding': 'zstd',
            'Content-Length': '99',
            'Content-Type': 'application/json',
            Vary: 'Accept-Encoding',
          },
        }),
      );

    const app = new Hono();
    app.route(
      '/',
      proxyRoute({
        apiBase: 'http://stub.local',
        adminToken: 'test-token',
        timeoutMs: 1000,
        fetch: encodedFetch,
      }),
    );

    const res = await app.request('/api/v3/workspaces/ws/peers/list');

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Encoding')).toBeNull();
    expect(res.headers.get('Content-Length')).toBeNull();
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(await res.json()).toEqual({ items: [] });
  });
});
