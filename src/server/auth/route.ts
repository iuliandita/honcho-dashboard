import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { AuthConfig } from './config';
import { verifyPassword } from './password';
import { createSessionCookie, verifySessionCookie } from './session';

export function authRoute(config: AuthConfig) {
  return new Hono()
    .get('/api/auth/status', async (c) => {
      const authenticated =
        config.mode === 'password'
          ? await verifySessionCookie(getCookie(c, config.cookieName), { secret: config.sessionSecret })
          : true;
      return c.json({ enabled: config.mode === 'password', authenticated });
    })
    .post('/api/auth/login', async (c) => {
      if (config.mode === 'off') return c.json({ authenticated: true });
      const body = (await c.req.json().catch(() => ({}))) as { password?: string };
      if (!body.password || !(await verifyPassword(config, body.password))) {
        return c.json({ error: 'invalid password' }, 401);
      }
      const session = await createSessionCookie({
        secret: config.sessionSecret,
        ttlSeconds: config.sessionTtlSeconds,
      });
      setCookie(c, config.cookieName, session.value, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: c.req.header('x-forwarded-proto') === 'https' || new URL(c.req.url).protocol === 'https:',
        path: '/',
        maxAge: config.sessionTtlSeconds,
      });
      return c.json({ authenticated: true });
    })
    .post('/api/auth/logout', (c) => {
      if (config.mode === 'password') {
        deleteCookie(c, config.cookieName, { path: '/' });
      }
      return c.json({ authenticated: false });
    });
}
