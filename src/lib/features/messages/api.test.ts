import type { ApiClient } from '$api/client';
import { describe, expect, it, vi } from 'vitest';
import { type MessagesPage, buildSessionMessagesQuery } from './api';

function mockClient<T>(data: T): ApiClient {
  return {
    get: vi.fn(async () => data) as ApiClient['get'],
    post: vi.fn(async () => data) as ApiClient['post'],
  };
}

describe('buildSessionMessagesQuery', () => {
  it('builds an infinite query keyed by workspace/peer/session/messages', () => {
    const client = mockClient({ items: [], total: 0, page: 1, size: 50, pages: 1 });
    const opts = buildSessionMessagesQuery(client, 'ws', 'p', 's');

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'peer', 'p', 'session', 's', 'messages']);
  });

  it('first page request omits cursor', async () => {
    const client = mockClient({
      items: [
        {
          id: 'm1',
          peer_id: 'p',
          session_id: 's',
          workspace_id: 'ws',
          content: 'hi',
          metadata: {},
          created_at: '2026-01-01T00:00:00Z',
          token_count: 1,
        },
      ],
      total: 51,
      page: 1,
      size: 50,
      pages: 2,
    });

    const opts = buildSessionMessagesQuery(client, 'ws', 'p', 's');
    const controller = new AbortController();
    const page = await opts.queryFn({
      pageParam: 1,
      signal: controller.signal,
      queryKey: opts.queryKey,
      meta: undefined,
      direction: 'forward',
    });

    expect(page.nextPage).toBe(2);
    expect(client.post).toHaveBeenCalledWith(
      '/v3/workspaces/ws/sessions/s/messages/list',
      { filters: null },
      { page: 1, size: 50, reverse: true },
      { signal: controller.signal },
    );
  });

  it('subsequent page request includes page number', async () => {
    const client = mockClient({ items: [], total: 50, page: 2, size: 50, pages: 2 });

    const opts = buildSessionMessagesQuery(client, 'ws', 'p', 's');
    const controller = new AbortController();
    await opts.queryFn({
      pageParam: 2,
      signal: controller.signal,
      queryKey: opts.queryKey,
      meta: undefined,
      direction: 'backward',
    });

    expect(client.post).toHaveBeenCalledWith(
      '/v3/workspaces/ws/sessions/s/messages/list',
      { filters: null },
      { page: 2, size: 50, reverse: true },
      { signal: controller.signal },
    );
  });

  it('getNextPageParam returns the next page number or undefined', () => {
    const client = mockClient({ items: [], total: 0, page: 1, size: 50, pages: 1 });
    const opts = buildSessionMessagesQuery(client, 'ws', 'p', 's');

    expect(opts.getNextPageParam({ messages: [], nextPage: 3 })).toBe(3);
    expect(opts.getNextPageParam({ messages: [], nextPage: null })).toBeUndefined();
  });
});
