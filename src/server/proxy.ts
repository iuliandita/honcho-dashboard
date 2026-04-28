import { Hono } from 'hono';

/**
 * Narrowed fetch signature: the proxy only ever calls with a `Request` object, so test stubs
 * can safely accept just `Request` rather than the full `RequestInfo | URL` overload set.
 */
export type FetchLike = (input: Request) => Response | Promise<Response>;

export interface ProxyConfig {
  apiBase: string;
  adminToken: string;
  timeoutMs: number;
  /** Inject for testing; defaults to global fetch in production. */
  fetch?: FetchLike;
}

interface ProxyErrorBody {
  error: string;
  detail?: string;
  status: number;
  traceId: string;
  upstream: 'honcho' | 'proxy';
}

function nanoTraceId(): string {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 12);
}

export function proxyRoute(config: ProxyConfig) {
  const upstreamFetch = config.fetch ?? globalThis.fetch;
  const apiBase = config.apiBase.replace(/\/$/, '');

  return new Hono().all('/api/*', async (c) => {
    const traceId = nanoTraceId();
    c.header('X-Trace-Id', traceId);

    // Strip /api prefix to compose target URL
    const path = c.req.path.replace(/^\/api/, '');
    const url = `${apiBase}${path}${c.req.url.includes('?') ? '?' + c.req.url.split('?')[1] : ''}`;

    const headers = new Headers();
    // Forward content-type and accept; never forward Authorization from client.
    const contentType = c.req.header('Content-Type');
    if (contentType) headers.set('Content-Type', contentType);
    const accept = c.req.header('Accept');
    if (accept) headers.set('Accept', accept);
    headers.set('Authorization', `Bearer ${config.adminToken}`);
    headers.set('X-Trace-Id', traceId);

    const init: RequestInit = {
      method: c.req.method,
      headers,
      signal: AbortSignal.timeout(config.timeoutMs),
    };
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      init.body = await c.req.arrayBuffer();
    }

    let upstreamRes: Response;
    try {
      upstreamRes = await upstreamFetch(new Request(url, init));
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === 'TimeoutError';
      const status = isTimeout ? 504 : 502;
      const errBody: ProxyErrorBody = {
        error: isTimeout ? 'upstream timeout' : 'upstream unreachable',
        detail: err instanceof Error ? err.message : String(err),
        status,
        traceId,
        upstream: 'proxy',
      };
      return c.json(errBody, status);
    }

    // Pass response straight through. Preserve all headers including Content-Type for SSE.
    const resHeaders = new Headers(upstreamRes.headers);
    resHeaders.set('X-Trace-Id', traceId);

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: resHeaders,
    });
  });
}
