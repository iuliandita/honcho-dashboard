import { describe, expect, it, vi } from 'vitest';
import { fetchAuthStatus, login, logout } from '../../../src/lib/auth/api';

describe('auth api', () => {
  it('fetches auth status', async () => {
    const fetch = vi.fn(async () => Response.json({ enabled: true, authenticated: false }));
    await expect(fetchAuthStatus({ fetch })).resolves.toEqual({ enabled: true, authenticated: false });
    expect(fetch).toHaveBeenCalledWith('/api/auth/status', { headers: { Accept: 'application/json' } });
  });

  it('posts login and logout requests', async () => {
    const fetch = vi.fn(async () => Response.json({ authenticated: true }));
    await login('secret', { fetch });
    await logout({ fetch });
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }));
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST' }));
  });
});
