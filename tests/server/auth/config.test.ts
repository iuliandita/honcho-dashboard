import { describe, expect, it } from 'vitest';
import { readAuthConfig } from '../../../src/server/auth/config';

describe('readAuthConfig', () => {
  it('defaults auth to off', () => {
    expect(readAuthConfig({})).toEqual({ mode: 'off' });
  });

  it('requires a password and session secret for password mode', () => {
    expect(() => readAuthConfig({ DASHBOARD_AUTH_MODE: 'password' })).toThrow(/DASHBOARD_SESSION_SECRET/);
  });

  it('accepts plaintext password mode for simple deployments', () => {
    expect(
      readAuthConfig({
        DASHBOARD_AUTH_MODE: 'password',
        DASHBOARD_AUTH_PASSWORD: 'secret',
        DASHBOARD_SESSION_SECRET: 'test-session-secret',
      }),
    ).toMatchObject({ mode: 'password', password: 'secret' });
  });
});
