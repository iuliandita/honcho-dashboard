import { describe, expect, it } from 'vitest';
import { authRoute } from '../../../src/server/auth/route';

const config = {
  mode: 'password',
  password: 'secret',
  sessionSecret: '0123456789abcdef0123456789abcdef',
  sessionTtlSeconds: 60,
  cookieName: 'test_session',
} as const;

describe('authRoute', () => {
  it('reports enabled unauthenticated status before login', async () => {
    const app = authRoute(config);

    const res = await app.request('/api/auth/status');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ enabled: true, authenticated: false });
  });

  it('sets a session cookie after login', async () => {
    const app = authRoute(config);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'secret' }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ authenticated: true });
    expect(res.headers.get('Set-Cookie')).toContain('test_session=');
    expect(res.headers.get('Set-Cookie')).toContain('HttpOnly');
  });

  it('rejects wrong passwords', async () => {
    const app = authRoute(config);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong' }),
    });

    expect(res.status).toBe(401);
  });
});
