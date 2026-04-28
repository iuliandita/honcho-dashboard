import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatStream } from './ChatStream.svelte';

function makeStreamingResponse(chunks: string[], headers: Record<string, string> = {}): Response {
  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(enc.encode(c));
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream', ...headers },
  });
}

function makeByteStreamingResponse(chunks: Uint8Array[], headers: Record<string, string> = {}): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(c);
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream', ...headers },
  });
}

describe('ChatStream', () => {
  let mockInvalidate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockInvalidate = vi.fn(async () => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in idle state', () => {
    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: vi.fn(),
    });

    expect(stream.tokens).toBe('');
    expect(stream.isStreaming).toBe(false);
    expect(stream.error).toBeNull();
    expect(stream.streamEnded).toBe(false);
    expect(stream.expectedEnd).toBe(false);
  });

  it('streams tokens and signals expected end on done event', async () => {
    const fetchMock = vi.fn(async () =>
      makeStreamingResponse([
        'data: {"type":"token","data":"hello "}\n\n',
        'data: {"type":"token","data":"world"}\n\n',
        'data: {"type":"done"}\n\n',
      ]),
    );

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('greet');

    expect(stream.tokens).toBe('hello world');
    expect(stream.isStreaming).toBe(false);
    expect(stream.streamEnded).toBe(true);
    expect(stream.expectedEnd).toBe(true);
    expect(stream.error).toBeNull();
    expect(mockInvalidate).toHaveBeenCalledWith('p');
  });

  it('ignores tokens after done event', async () => {
    const fetchMock = vi.fn(async () =>
      makeStreamingResponse([
        'data: {"type":"token","data":"before"}\n\n',
        'data: {"type":"done"}\n\n',
        'data: {"type":"token","data":"after"}\n\n',
      ]),
    );

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('greet');

    expect(stream.tokens).toBe('before');
    expect(stream.expectedEnd).toBe(true);
    expect(stream.error).toBeNull();
  });

  it('reassembles multi-byte UTF-8 split across chunks', async () => {
    const enc = new TextEncoder();
    const payload = enc.encode('data: {"type":"token","data":"café"}\n\ndata: {"type":"done"}\n\n');
    const splitAt = payload.findIndex((byte) => byte === 0xc3) + 1;
    const fetchMock = vi.fn(async () => makeByteStreamingResponse([payload.slice(0, splitAt), payload.slice(splitAt)]));

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('greet');

    expect(stream.tokens).toBe('café');
    expect(stream.expectedEnd).toBe(true);
    expect(stream.error).toBeNull();
  });

  it('records error on error event', async () => {
    const fetchMock = vi.fn(async () =>
      makeStreamingResponse([
        'data: {"type":"token","data":"partial"}\n\n',
        'data: {"type":"error","data":"upstream lost"}\n\n',
      ]),
    );

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('greet');

    expect(stream.tokens).toBe('partial');
    expect(stream.error?.message).toContain('upstream lost');
    expect(stream.streamEnded).toBe(true);
    expect(stream.expectedEnd).toBe(false);
    expect(mockInvalidate).not.toHaveBeenCalled();
  });

  it('preserves trace ID on streamed error events', async () => {
    const fetchMock = vi.fn(async () =>
      makeStreamingResponse(['data: {"type":"error","data":"upstream lost"}\n\n'], { 'X-Trace-Id': 'trace-1' }),
    );

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('greet');

    expect(stream.error?.traceId).toBe('trace-1');
  });

  it('marks stream as unexpectedly ended when reader closes without done', async () => {
    const fetchMock = vi.fn(async () => makeStreamingResponse(['data: {"type":"token","data":"abrupt"}\n\n']));

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('greet');

    expect(stream.tokens).toBe('abrupt');
    expect(stream.streamEnded).toBe(true);
    expect(stream.expectedEnd).toBe(false);
    expect(stream.error?.message).toMatch(/interrupted/i);
  });

  it('records HonchoApiError on non-200 response', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: 'forbidden', status: 403, traceId: 't1', upstream: 'honcho' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
    );

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('q');

    expect(stream.error?.status).toBe(403);
    expect(stream.tokens).toBe('');
    expect(stream.streamEnded).toBe(true);
  });

  it('reset() clears state for a new send', async () => {
    const fetchMock = vi.fn(async () =>
      makeStreamingResponse(['data: {"type":"token","data":"once"}\n\ndata: {"type":"done"}\n\n']),
    );

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('q1');
    expect(stream.tokens).toBe('once');

    stream.reset();
    expect(stream.tokens).toBe('');
    expect(stream.streamEnded).toBe(false);
    expect(stream.error).toBeNull();
  });

  it('cancel() aborts an in-flight stream', async () => {
    let resolveBody: (() => void) | null = null;
    const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          resolveBody = () => controller.close();
          init?.signal?.addEventListener('abort', () => {
            try {
              controller.error(new DOMException('aborted', 'AbortError'));
            } catch {
              // already errored
            }
          });
        },
      });
      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });
    });

    const stream = new ChatStream({
      workspaceId: 'ws',
      peerId: 'p',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    const sendPromise = stream.send('q');

    await Promise.resolve();
    stream.cancel();
    await sendPromise;

    expect(stream.isStreaming).toBe(false);
    expect(stream.streamEnded).toBe(true);
    expect(resolveBody).not.toBeNull();
  });

  it('builds a workspace-scoped URL', async () => {
    const fetchMock = vi.fn(async () => makeStreamingResponse(['data: {"type":"done"}\n\n']));

    const stream = new ChatStream({
      workspaceId: 'ws-alpha',
      peerId: 'peer-7',
      invalidatePeer: mockInvalidate,
      fetch: fetchMock,
    });
    await stream.send('q');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v3/workspaces/ws-alpha/peers/peer-7/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ query: 'q', stream: true, reasoning_level: 'low' }),
      }),
    );
  });
});
