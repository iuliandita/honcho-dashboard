import { describe, expect, it, vi } from 'vitest';
import type { ApiClient } from '$api/client';
import { buildPeersQuery, buildSessionsQuery, buildWorkspacesQuery } from './api';

function mockClient<T>(data: T): ApiClient {
  return {
    get: vi.fn(async () => data) as ApiClient['get'],
    post: vi.fn(async () => data) as ApiClient['post'],
  };
}

describe('buildWorkspacesQuery', () => {
  it('builds a POST query against /v3/workspaces/list with an empty filter body', async () => {
    const data = [{ id: 'ws-1', name: 'first' }];
    const client = mockClient(data);

    const opts = buildWorkspacesQuery(client);

    expect(opts.queryKey).toEqual(['workspaces']);
    const result = await opts.queryFn();
    expect(result).toEqual(data);
    expect(client.post).toHaveBeenCalledWith('/v3/workspaces/list', {});
  });
});

describe('buildPeersQuery', () => {
  it('builds a POST query for peers under a workspace', async () => {
    const data = [{ id: 'peer-1', name: 'p1' }];
    const client = mockClient(data);

    const opts = buildPeersQuery(client, 'ws-1');

    expect(opts.queryKey).toEqual(['workspace', 'ws-1', 'peers']);
    await opts.queryFn();
    expect(client.post).toHaveBeenCalledWith('/v3/workspaces/ws-1/peers/list', {});
  });
});

describe('buildSessionsQuery', () => {
  it('builds a POST query for sessions under a peer (no /list suffix)', async () => {
    const data = [{ id: 'sess-1' }];
    const client = mockClient(data);

    const opts = buildSessionsQuery(client, 'ws-1', 'peer-1');

    expect(opts.queryKey).toEqual(['workspace', 'ws-1', 'peer', 'peer-1', 'sessions']);
    await opts.queryFn();
    expect(client.post).toHaveBeenCalledWith('/v3/workspaces/ws-1/peers/peer-1/sessions', {});
  });
});
