import { describe, expect, it } from 'vitest';
import { HonchoApiError, parseErrorBody } from '../../../src/lib/api/errors';

describe('HonchoApiError', () => {
  it('captures status, traceId, upstream', () => {
    const err = new HonchoApiError('boom', {
      status: 502,
      traceId: 'abc123',
      upstream: 'proxy',
    });

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('boom');
    expect(err.status).toBe(502);
    expect(err.traceId).toBe('abc123');
    expect(err.upstream).toBe('proxy');
  });
});

describe('parseErrorBody', () => {
  it('parses a well-formed Hono proxy error', async () => {
    const res = new Response(
      JSON.stringify({
        error: 'upstream unreachable',
        detail: 'ECONNREFUSED',
        status: 502,
        traceId: 'trace-1',
        upstream: 'proxy',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );

    const err = await parseErrorBody(res);

    expect(err).toBeInstanceOf(HonchoApiError);
    expect(err.status).toBe(502);
    expect(err.traceId).toBe('trace-1');
    expect(err.upstream).toBe('proxy');
    expect(err.detail).toBe('ECONNREFUSED');
  });

  it('falls back to text body when response is not JSON', async () => {
    const res = new Response('plain error text', {
      status: 500,
      headers: { 'Content-Type': 'text/plain', 'X-Trace-Id': 'trace-2' },
    });

    const err = await parseErrorBody(res);

    expect(err.status).toBe(500);
    expect(err.traceId).toBe('trace-2');
    expect(err.upstream).toBe('honcho');
    expect(err.message).toContain('plain error text');
  });

  it('handles missing body gracefully', async () => {
    const res = new Response(null, { status: 504, headers: { 'X-Trace-Id': 'trace-3' } });

    const err = await parseErrorBody(res);

    expect(err.status).toBe(504);
    expect(err.traceId).toBe('trace-3');
  });
});
