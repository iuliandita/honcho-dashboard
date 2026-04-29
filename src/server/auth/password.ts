import type { AuthConfig } from './config';

export async function verifyPassword(config: AuthConfig, candidate: string): Promise<boolean> {
  if (config.mode !== 'password') return false;
  if (config.passwordHash) return Bun.password.verify(candidate, config.passwordHash);
  return candidate === config.password;
}
