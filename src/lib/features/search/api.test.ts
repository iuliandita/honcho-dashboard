import type { ApiClient } from '$api/client';
import { describe, expect, it, vi } from 'vitest';
import { buildWorkspaceSearchQuery, type SearchResponse } from './api';

function mockClient<T>(data: T): ApiClient {
  return {
    get: vi.fn(async () => data) as ApiClient['get'],
    post: vi.fn(async () => data) as ApiClient['post'],
  };
}

describe('buildWorkspaceSearchQuery', () => {
  it('keys by workspace+search+query+topic', () => {
    const client = mockClient<SearchResponse>({ results: [] });
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'coffee', 'beverage');

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'search', 'coffee', 'beverage']);
  });

  it('uses empty string for null topic', () => {
    const client = mockClient<SearchResponse>({ results: [] });
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'coffee', null);

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'search', 'coffee', '']);
  });

  it('GETs with query and topic params', async () => {
    const client = mockClient<SearchResponse>({ results: [] });
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'coffee', 'beverage');
    await opts.queryFn();

    expect(client.get).toHaveBeenCalledWith('/v3/workspaces/ws/search', {
      q: 'coffee',
      topic: 'beverage',
      limit: 50,
    });
  });

  it('omits topic param when null', async () => {
    const client = mockClient<SearchResponse>({ results: [] });
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'coffee', null);
    await opts.queryFn();

    expect(client.get).toHaveBeenCalledWith('/v3/workspaces/ws/search', {
      q: 'coffee',
      limit: 50,
    });
  });

  it('disabled when query is empty', () => {
    const client = mockClient<SearchResponse>({ results: [] });
    const opts = buildWorkspaceSearchQuery(client, 'ws', '', null);

    expect(opts.enabled).toBe(false);
  });

  it('enabled when query has content', () => {
    const client = mockClient<SearchResponse>({ results: [] });
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'x', null);

    expect(opts.enabled).toBe(true);
  });
});
