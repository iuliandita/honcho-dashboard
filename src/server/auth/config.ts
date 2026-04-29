export type AuthConfig =
  | { mode: 'off' }
  | {
      mode: 'password';
      password?: string;
      passwordHash?: string;
      sessionSecret: string;
      sessionTtlSeconds: number;
      cookieName: string;
    };

export function readAuthConfig(env: Record<string, string | undefined> = process.env): AuthConfig {
  const mode = env.DASHBOARD_AUTH_MODE ?? 'off';
  if (mode === 'off') return { mode: 'off' };
  if (mode !== 'password') throw new Error(`Unsupported DASHBOARD_AUTH_MODE: ${mode}`);

  const sessionSecret = env.DASHBOARD_SESSION_SECRET;
  if (!sessionSecret) throw new Error('Missing required env var: DASHBOARD_SESSION_SECRET');

  const password = env.DASHBOARD_AUTH_PASSWORD;
  const passwordHash = env.DASHBOARD_AUTH_PASSWORD_HASH;
  if (!password && !passwordHash) {
    throw new Error('Set DASHBOARD_AUTH_PASSWORD or DASHBOARD_AUTH_PASSWORD_HASH when password auth is enabled');
  }

  return {
    mode: 'password',
    password,
    passwordHash,
    sessionSecret,
    sessionTtlSeconds: Number.parseInt(env.DASHBOARD_SESSION_TTL_SECONDS ?? '43200', 10),
    cookieName: env.DASHBOARD_SESSION_COOKIE ?? 'honcho_dashboard_session',
  };
}
