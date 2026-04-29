import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/server/index';
import { createStubHoncho } from './stub-honcho';

describe('createApp', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('mounts /healthz, /api/runtime-config, and proxy', async () => {
    const stub = createStubHoncho();
    const app = createApp({
      apiBase: 'http://stub.local',
      adminToken: 'test-token',
      workspaceId: 'ws-abc',
      version: '0.1.0',
      timeoutMs: 1000,
      buildDir: './build',
      fetch: (req) => stub.app.fetch(req),
    });

    const health = await app.request('/healthz');
    expect(health.status).toBe(200);
    expect(health.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(health.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
    expect(health.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(health.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(health.headers.get('X-Frame-Options')).toBe('DENY');

    const config = await app.request('/api/runtime-config');
    expect(await config.json()).toEqual({ workspaceId: 'ws-abc', version: '0.1.0' });

    const proxied = await app.request('/api/v3/workspaces/ws-abc/peers/abc/representation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_conclusions: null }),
    });
    expect(proxied.status).toBe(200);
    expect(stub.requests[0]?.authorization).toBe('Bearer test-token');
  });

  it('reads env vars when no overrides given', async () => {
    vi.stubEnv('HONCHO_API_BASE', 'http://env.test');
    vi.stubEnv('HONCHO_ADMIN_TOKEN', 'env-token');
    vi.stubEnv('HONCHO_WORKSPACE_ID', 'env-ws');

    const app = createApp();
    const config = await app.request('/api/runtime-config');
    expect(config.status).toBe(200);
    expect(await config.json()).toEqual({ workspaceId: 'env-ws', version: '1.5.0' });
  });

  it('throws if required env vars are missing', () => {
    vi.stubEnv('HONCHO_API_BASE', '');
    vi.stubEnv('HONCHO_ADMIN_TOKEN', '');

    expect(() => createApp()).toThrow(/HONCHO_API_BASE/);
  });

  it('protects proxied Honcho API routes when password auth is enabled', async () => {
    const stub = createStubHoncho();
    const app = createApp({
      apiBase: 'http://stub.local',
      adminToken: 'test-token',
      workspaceId: 'ws-abc',
      version: '0.1.0',
      timeoutMs: 1000,
      buildDir: './build',
      authConfig: {
        mode: 'password',
        password: 'secret',
        sessionSecret: '0123456789abcdef0123456789abcdef',
        sessionTtlSeconds: 60,
        cookieName: 'test_session',
      },
      fetch: (req) => stub.app.fetch(req),
    });

    const blocked = await app.request('/api/v3/workspaces/ws-abc/peers/abc/representation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_conclusions: null }),
    });
    expect(blocked.status).toBe(401);

    const login = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'secret' }),
    });

    const proxied = await app.request('/api/v3/workspaces/ws-abc/peers/abc/representation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: login.headers.get('Set-Cookie') ?? '' },
      body: JSON.stringify({ max_conclusions: null }),
    });

    expect(proxied.status).toBe(200);
  });
});
