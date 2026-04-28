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
  detail?: unknown;
  status?: number;
  traceId?: string;
  upstream?: Upstream;
}

function stringifyDetail(detail: unknown): string | undefined {
  if (detail === undefined || detail === null) return undefined;
  if (typeof detail === 'string') return detail;
  try {
    return JSON.stringify(detail);
  } catch {
    return String(detail);
  }
}

export async function parseErrorBody(res: Response): Promise<HonchoApiError> {
  const fallbackTraceId = res.headers.get('X-Trace-Id') ?? '';
  const contentType = res.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const body = (await res.json()) as ErrorBodyShape;
      const detail = stringifyDetail(body.detail);
      return new HonchoApiError(body.error ?? detail ?? `HTTP ${res.status}`, {
        status: body.status ?? res.status,
        traceId: body.traceId ?? fallbackTraceId,
        upstream: body.upstream ?? 'honcho',
        detail,
      });
    } catch {
      // Fall through to text path
    }
  }

  const text = await res.text().catch(() => '');

  return new HonchoApiError(text || `HTTP ${res.status}`, {
    status: res.status,
    traceId: fallbackTraceId,
    upstream: 'honcho',
  });
}
