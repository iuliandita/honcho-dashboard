import type { ApiClient } from '$api/client';
import { describe, expect, it, vi } from 'vitest';
import { buildSessionMessagesQuery, type MessagesPage } from './api';

function mockClient<T>(data: T): ApiClient {
  return {
    get: vi.fn(async () => data) as ApiClient['get'],
    post: vi.fn(async () => data) as ApiClient['post'],
  };
}

describe('buildSessionMessagesQuery', () => {
  it('builds an infinite query keyed by workspace/peer/session/messages', () => {
    const client = mockClient<MessagesPage>({ messages: [], cursor: null });
    const opts = buildSessionMessagesQuery(client, 'ws', 'p', 's');

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'peer', 'p', 'session', 's', 'messages']);
  });

  it('first page request omits cursor', async () => {
    const client = mockClient<MessagesPage>({
      messages: [{ id: 'm1', role: 'user', content: 'hi', createdAt: '2026-01-01T00:00:00Z' }],
      cursor: 'c2',
    });

    const opts = buildSessionMessagesQuery(client, 'ws', 'p', 's');
    const page = await opts.queryFn({
      pageParam: null,
      signal: new AbortController().signal,
      queryKey: opts.queryKey,
      meta: undefined,
      direction: 'forward',
    });

    expect(page.cursor).toBe('c2');
    expect(client.get).toHaveBeenCalledWith('/v3/workspaces/ws/peers/p/sessions/s/messages', { limit: 50 });
  });

  it('subsequent page request includes cursor', async () => {
    const client = mockClient<MessagesPage>({ messages: [], cursor: null });

    const opts = buildSessionMessagesQuery(client, 'ws', 'p', 's');
    await opts.queryFn({
      pageParam: 'c2',
      signal: new AbortController().signal,
      queryKey: opts.queryKey,
      meta: undefined,
      direction: 'backward',
    });

    expect(client.get).toHaveBeenCalledWith('/v3/workspaces/ws/peers/p/sessions/s/messages', {
      limit: 50,
      cursor: 'c2',
    });
  });

  it('getNextPageParam returns the page cursor or undefined', () => {
    const client = mockClient({ messages: [], cursor: null });
    const opts = buildSessionMessagesQuery(client, 'ws', 'p', 's');

    expect(opts.getNextPageParam({ messages: [], cursor: 'c3' })).toBe('c3');
    expect(opts.getNextPageParam({ messages: [], cursor: null })).toBeUndefined();
  });
});
