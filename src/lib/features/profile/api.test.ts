import type { ApiClient } from '$api/client';
import { describe, expect, it, vi } from 'vitest';
import { type ProfileResponse, buildPeerProfileQuery } from './api';

function mockClient<T>(data: T): ApiClient {
  return {
    get: vi.fn(async () => data) as ApiClient['get'],
    post: vi.fn(async () => data) as ApiClient['post'],
  };
}

describe('buildPeerProfileQuery', () => {
  it('keys by workspace+peer+profile', () => {
    const client = mockClient<ProfileResponse>({ markdown: '', updatedAt: null });
    const opts = buildPeerProfileQuery(client, 'ws', 'p');

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'peer', 'p', 'profile']);
  });

  it('GETs the profile endpoint', async () => {
    const client = mockClient<ProfileResponse>({ markdown: '# hi', updatedAt: '2026-01-01T00:00:00Z' });
    const opts = buildPeerProfileQuery(client, 'ws', 'p');

    const result = await opts.queryFn();
    expect(result.markdown).toBe('# hi');
    expect(client.get).toHaveBeenCalledWith('/v3/workspaces/ws/peers/p/profile');
  });
});
