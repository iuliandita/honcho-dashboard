import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/index';
import { createStubHoncho } from './stub-honcho';

describe('createApp', () => {
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

  it('reads env vars when no overrides given', () => {
    const original = { ...process.env };
    process.env.HONCHO_API_BASE = 'http://env.test';
    process.env.HONCHO_ADMIN_TOKEN = 'env-token';
    process.env.HONCHO_WORKSPACE_ID = 'env-ws';

    try {
      const app = createApp();
      expect(app).toBeDefined();
    } finally {
      process.env = original;
    }
  });

  it('throws if required env vars are missing', () => {
    const original = { ...process.env };
    // delete (not assignment to undefined): process.env coerces undefined to the string "undefined",
    // which would defeat the readEnvRequired check.
    // biome-ignore lint/performance/noDelete: process.env requires real removal, not undefined assignment.
    delete process.env.HONCHO_API_BASE;
    // biome-ignore lint/performance/noDelete: process.env requires real removal, not undefined assignment.
    delete process.env.HONCHO_ADMIN_TOKEN;

    try {
      expect(() => createApp()).toThrow(/HONCHO_API_BASE/);
    } finally {
      process.env = original;
    }
  });
});
