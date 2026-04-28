import { Hono } from 'hono';

export const healthRoute = new Hono().get('/healthz', (c) => {
  return c.json({ status: 'ok' });
});
