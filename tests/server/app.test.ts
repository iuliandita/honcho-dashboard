import { afterEach, describe, expect, it, vi } from 'vitest';
import packageJson from '../../package.json';
import { createApp, readListenPort } from '../../src/server/index';
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
    const csp = health.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toMatch(/script-src 'self' 'nonce-[^']+'/);
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
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
    expect(await config.json()).toEqual({ workspaceId: 'env-ws', version: packageJson.version });
  });

  it('allows runtime version to be injected for container releases', async () => {
    vi.stubEnv('HONCHO_API_BASE', 'http://env.test');
    vi.stubEnv('HONCHO_ADMIN_TOKEN', 'env-token');
    vi.stubEnv('HONCHO_DASHBOARD_VERSION', '1.6.0-build.7');

    const app = createApp();
    const config = await app.request('/api/runtime-config');
    expect(config.status).toBe(200);
    expect(await config.json()).toEqual({ workspaceId: null, version: '1.6.0-build.7' });
  });

  it('throws if required env vars are missing', () => {
    vi.stubEnv('HONCHO_API_BASE', '');
    vi.stubEnv('HONCHO_ADMIN_TOKEN', '');

    expect(() => createApp()).toThrow(/HONCHO_API_BASE/);
  });

  it('throws before serving when env config values are invalid', () => {
    vi.stubEnv('HONCHO_API_BASE', 'ftp://honcho.test');
    vi.stubEnv('HONCHO_ADMIN_TOKEN', 'env-token');
    expect(() => createApp()).toThrow(/HONCHO_API_BASE must be an http\(s\) URL/);

    vi.stubEnv('HONCHO_API_BASE', 'https://honcho.test');
    vi.stubEnv('HONCHO_PROXY_TIMEOUT', 'nan');
    expect(() => createApp()).toThrow(/HONCHO_PROXY_TIMEOUT must be an integer/);

    vi.stubEnv('HONCHO_PROXY_TIMEOUT', '301');
    expect(() => createApp()).toThrow(/HONCHO_PROXY_TIMEOUT must be between 1 and 300/);
  });

  it('throws before startup when PORT is invalid', () => {
    vi.stubEnv('PORT', '70000');

    expect(() => readListenPort()).toThrow(/PORT must be between 1 and 65535/);
  });

  it('validates explicit createApp overrides too', () => {
    expect(() =>
      createApp({
        apiBase: 'http://stub.local',
        adminToken: 'test-token',
        workspaceId: null,
        version: '0.1.0',
        timeoutMs: 1000,
        buildDir: './build',
      }),
    ).not.toThrow();

    expect(() =>
      createApp({
        apiBase: 'not-a-url',
        adminToken: 'test-token',
        workspaceId: null,
        version: '0.1.0',
        timeoutMs: 1000,
        buildDir: './build',
      }),
    ).toThrow(/apiBase must be an http\(s\) URL/);
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
        sessionSecret: 'test-session-secret',
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
