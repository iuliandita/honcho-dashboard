import type { ApiClient } from '$api/client';
import { describe, expect, it, vi } from 'vitest';
import { mockClient } from '../../../../tests/lib/test-utils';
import { buildPeersQuery, buildSessionsQuery, buildWorkspacesQuery } from './api';

describe('buildWorkspacesQuery', () => {
  it('builds a POST query against /v3/workspaces/list and unwraps the page envelope', async () => {
    const data = {
      items: [{ id: 'ws-1', metadata: { name: 'first' }, created_at: '2026-01-01T00:00:00Z' }],
      total: 1,
      page: 1,
      size: 50,
      pages: 1,
    };
    const client = mockClient(data);

    const opts = buildWorkspacesQuery(client);

    expect(opts.queryKey).toEqual(['workspaces']);
    const result = await opts.queryFn();
    expect(result).toEqual(data.items);
    expect(client.post).toHaveBeenCalledWith('/v3/workspaces/list', { filters: null }, { page: 1, size: 50 });
  });

  it('continues through all workspace pages', async () => {
    const client: ApiClient = {
      get: vi.fn() as ApiClient['get'],
      post: vi
        .fn()
        .mockResolvedValueOnce({
          items: [{ id: 'ws-1', metadata: {}, created_at: '2026-01-01T00:00:00Z' }],
          total: 2,
          page: 1,
          size: 1,
          pages: 2,
        })
        .mockResolvedValueOnce({
          items: [{ id: 'ws-2', metadata: {}, created_at: '2026-01-02T00:00:00Z' }],
          total: 2,
          page: 2,
          size: 1,
          pages: 2,
        }) as ApiClient['post'],
    };

    const result = await buildWorkspacesQuery(client).queryFn();

    expect(result.map((item) => item.id)).toEqual(['ws-1', 'ws-2']);
    expect(client.post).toHaveBeenNthCalledWith(2, '/v3/workspaces/list', { filters: null }, { page: 2, size: 50 });
  });
});

describe('buildPeersQuery', () => {
  it('builds a POST query for peers under a workspace and unwraps the page envelope', async () => {
    const data = {
      items: [{ id: 'peer-1', workspace_id: 'ws-1', metadata: { name: 'p1' }, created_at: '2026-01-01T00:00:00Z' }],
      total: 1,
      page: 1,
      size: 50,
      pages: 1,
    };
    const client = mockClient(data);

    const opts = buildPeersQuery(client, 'ws-1');

    expect(opts.queryKey).toEqual(['workspace', 'ws-1', 'peers']);
    const result = await opts.queryFn();
    expect(result).toEqual(data.items);
    expect(client.post).toHaveBeenCalledWith(
      '/v3/workspaces/ws-1/peers/list',
      { filters: null },
      { page: 1, size: 50 },
    );
  });

  it('encodes workspace IDs in peer-list API paths', async () => {
    const client = mockClient({ items: [], total: 0, page: 1, size: 50, pages: 1 });

    await buildPeersQuery(client, 'ws /#?').queryFn();

    expect(client.post).toHaveBeenCalledWith(
      '/v3/workspaces/ws%20%2F%23%3F/peers/list',
      { filters: null },
      { page: 1, size: 50 },
    );
  });
});

describe('buildSessionsQuery', () => {
  it('builds a POST query for sessions under a peer and unwraps the page envelope', async () => {
    const data = {
      items: [
        { id: 'sess-1', workspace_id: 'ws-1', is_active: true, metadata: {}, created_at: '2026-01-01T00:00:00Z' },
      ],
      total: 1,
      page: 1,
      size: 50,
      pages: 1,
    };
    const client = mockClient(data);

    const opts = buildSessionsQuery(client, 'ws-1', 'peer-1');

    expect(opts.queryKey).toEqual(['workspace', 'ws-1', 'peer', 'peer-1', 'sessions']);
    const result = await opts.queryFn();
    expect(result).toEqual(data.items);
    expect(client.post).toHaveBeenCalledWith(
      '/v3/workspaces/ws-1/peers/peer-1/sessions',
      { filters: null },
      { page: 1, size: 50 },
    );
  });

  it('encodes workspace and peer IDs in session-list API paths', async () => {
    const client = mockClient({ items: [], total: 0, page: 1, size: 50, pages: 1 });

    await buildSessionsQuery(client, 'ws /#?', 'peer /#?').queryFn();

    expect(client.post).toHaveBeenCalledWith(
      '/v3/workspaces/ws%20%2F%23%3F/peers/peer%20%2F%23%3F/sessions',
      { filters: null },
      { page: 1, size: 50 },
    );
  });
});
