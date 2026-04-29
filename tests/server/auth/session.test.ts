import { describe, expect, it } from 'vitest';
import { createSessionCookie, verifySessionCookie } from '../../../src/server/auth/session';

describe('session cookies', () => {
  it('verifies a signed session token', async () => {
    const token = await createSessionCookie({ secret: 'secret-value', ttlSeconds: 60, now: 1000 });
    await expect(verifySessionCookie(token.value, { secret: 'secret-value', now: 1000 })).resolves.toBe(true);
  });

  it('rejects an expired token', async () => {
    const token = await createSessionCookie({ secret: 'secret-value', ttlSeconds: 1, now: 1000 });
    await expect(verifySessionCookie(token.value, { secret: 'secret-value', now: 3000 })).resolves.toBe(false);
  });
});
