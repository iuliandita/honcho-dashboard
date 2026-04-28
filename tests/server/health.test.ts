import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { healthRoute } from '../../src/server/health';

describe('GET /healthz', () => {
  it('returns 200 with ok body', async () => {
    const app = new Hono();
    app.route('/', healthRoute);

    const res = await app.request('/healthz');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
