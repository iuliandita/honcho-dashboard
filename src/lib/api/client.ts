import { parseErrorBody } from './errors';

export type ClientFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface ApiClientOptions {
  /** Defaults to global fetch. Override for testing. */
  fetch?: ClientFetch;
  /** Request path prefix. Default `/api`. */
  basePath?: string;
}

export interface ApiRequestOptions {
  signal?: AbortSignal;
}

export interface ApiClient {
  get<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean | null | undefined>,
    options?: ApiRequestOptions,
  ): Promise<T>;
  post<T = unknown>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | null | undefined>,
    options?: ApiRequestOptions,
  ): Promise<T>;
}

function buildQuery(params?: Record<string, string | number | boolean | null | undefined>): string {
  if (!params) return '';
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const fetcher: ClientFetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const base = options.basePath ?? '/api';

  async function request<T>(path: string, init: RequestInit): Promise<T> {
    const res = await fetcher(`${base}${path}`, init);
    if (!res.ok) {
      throw await parseErrorBody(res);
    }
    // No current Honcho endpoint used by the dashboard returns 204; keep the client tolerant for future empty writes.
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  return {
    get<T>(
      path: string,
      params?: Record<string, string | number | boolean | null | undefined>,
      options?: ApiRequestOptions,
    ) {
      return request<T>(`${path}${buildQuery(params)}`, { method: 'GET', signal: options?.signal });
    },
    post<T>(
      path: string,
      body?: unknown,
      params?: Record<string, string | number | boolean | null | undefined>,
      options?: ApiRequestOptions,
    ) {
      return request<T>(`${path}${buildQuery(params)}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      });
    },
  };
}
