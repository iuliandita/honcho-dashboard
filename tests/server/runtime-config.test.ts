import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { runtimeConfigRoute } from '../../src/server/runtime-config';

describe('GET /api/runtime-config', () => {
  it('returns workspaceId from env when set', async () => {
    const app = new Hono();
    app.route('/', runtimeConfigRoute({ workspaceId: 'ws-abc', version: '0.1.0' }));

    const res = await app.request('/api/runtime-config');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ workspaceId: 'ws-abc', version: '0.1.0' });
  });

  it('returns null workspaceId when env not set', async () => {
    const app = new Hono();
    app.route('/', runtimeConfigRoute({ workspaceId: null, version: '0.1.0' }));

    const res = await app.request('/api/runtime-config');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ workspaceId: null, version: '0.1.0' });
  });
});
