import { describe, expect, it } from 'vitest';
import { mockClient } from '../../../../tests/lib/test-utils';
import { type SearchResponse, buildWorkspaceSearchQuery } from './api';

describe('buildWorkspaceSearchQuery', () => {
  it('keys by workspace+search+query+topic', () => {
    const client = mockClient([]);
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'coffee', 'beverage');

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'search', 'coffee', 'beverage']);
  });

  it('uses empty string for null topic', () => {
    const client = mockClient([]);
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'coffee', null);

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'search', 'coffee', '']);
  });

  it('POSTs search options with topic filters', async () => {
    const client = mockClient([
      {
        id: 'm1',
        peer_id: 'peer-1',
        session_id: 'sess-1',
        workspace_id: 'ws',
        content: 'coffee',
        metadata: { topic: 'beverage' },
        created_at: '2026-01-01T00:00:00Z',
        token_count: 1,
      },
    ]);
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'coffee', 'beverage');
    await opts.queryFn();

    expect(client.post).toHaveBeenCalledWith('/v3/workspaces/ws/search', {
      query: 'coffee',
      filters: { topic: 'beverage' },
      limit: 50,
    });
  });

  it('omits filters when topic is null', async () => {
    const client = mockClient([]);
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'coffee', null);
    await opts.queryFn();

    expect(client.post).toHaveBeenCalledWith('/v3/workspaces/ws/search', {
      query: 'coffee',
      filters: null,
      limit: 50,
    });
  });

  it('disabled when query is empty', () => {
    const client = mockClient([]);
    const opts = buildWorkspaceSearchQuery(client, 'ws', '', null);

    expect(opts.enabled).toBe(false);
  });

  it('enabled when query has content', () => {
    const client = mockClient([]);
    const opts = buildWorkspaceSearchQuery(client, 'ws', 'x', null);

    expect(opts.enabled).toBe(true);
  });
});
