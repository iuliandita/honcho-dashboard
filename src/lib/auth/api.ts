import { parseErrorBody } from '$api/errors';

export interface AuthStatus {
  enabled: boolean;
  authenticated: boolean;
}

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>;

export interface AuthApiOptions {
  fetch?: FetchLike;
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await parseErrorBody(res);
  return (await res.json()) as T;
}

export async function fetchAuthStatus(options: AuthApiOptions = {}) {
  const fetcher = options.fetch ?? fetch;
  return parse<AuthStatus>(await fetcher('/api/auth/status', { headers: { Accept: 'application/json' } }));
}

export async function login(password: string, options: AuthApiOptions = {}) {
  const fetcher = options.fetch ?? fetch;
  return parse<{ authenticated: true }>(
    await fetcher('/api/auth/login', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    }),
  );
}

export async function logout(options: AuthApiOptions = {}) {
  const fetcher = options.fetch ?? fetch;
  return parse<{ authenticated: false }>(
    await fetcher('/api/auth/logout', { method: 'POST', headers: { Accept: 'application/json' } }),
  );
}
