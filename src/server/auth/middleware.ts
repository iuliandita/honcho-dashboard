import { getCookie } from 'hono/cookie';
import type { MiddlewareHandler } from 'hono';
import type { AuthConfig } from './config';
import { verifySessionCookie } from './session';

export function authMiddleware(config: AuthConfig): MiddlewareHandler {
  return async (c, next) => {
    if (config.mode === 'off') return next();
    const authenticated = await verifySessionCookie(getCookie(c, config.cookieName), {
      secret: config.sessionSecret,
    });
    if (!authenticated) return c.json({ error: 'authentication required', status: 401 }, 401);
    return next();
  };
}
