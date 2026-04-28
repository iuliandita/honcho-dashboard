export type Upstream = 'honcho' | 'proxy';

export interface HonchoApiErrorInit {
  status: number;
  traceId: string;
  upstream: Upstream;
  detail?: string;
}

export class HonchoApiError extends Error {
  readonly status: number;
  readonly traceId: string;
  readonly upstream: Upstream;
  readonly detail?: string;

  constructor(message: string, init: HonchoApiErrorInit) {
    super(message);
    this.name = 'HonchoApiError';
    this.status = init.status;
    this.traceId = init.traceId;
    this.upstream = init.upstream;
    this.detail = init.detail;
  }
}

interface ErrorBodyShape {
  error?: string;
  detail?: string;
  status?: number;
  traceId?: string;
  upstream?: Upstream;
}

export async function parseErrorBody(res: Response): Promise<HonchoApiError> {
  const fallbackTraceId = res.headers.get('X-Trace-Id') ?? '';
  const contentType = res.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const body = (await res.json()) as ErrorBodyShape;
      return new HonchoApiError(body.error ?? `HTTP ${res.status}`, {
        status: body.status ?? res.status,
        traceId: body.traceId ?? fallbackTraceId,
        upstream: body.upstream ?? 'honcho',
        detail: body.detail,
      });
    } catch {
      // Fall through to text path
    }
  }

  let text = '';
  try {
    text = await res.text();
  } catch {
    // empty body
  }

  return new HonchoApiError(text || `HTTP ${res.status}`, {
    status: res.status,
    traceId: fallbackTraceId,
    upstream: 'honcho',
  });
}
