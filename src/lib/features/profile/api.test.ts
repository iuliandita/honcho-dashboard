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
    const client = mockClient({ representation: '' });
    const opts = buildPeerProfileQuery(client, 'ws', 'p');

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'peer', 'p', 'profile']);
  });

  it('synthesizes profile markdown from the OSS representation endpoint', async () => {
    const client = mockClient({ representation: '# hi' });
    const opts = buildPeerProfileQuery(client, 'ws', 'p');

    const result = await opts.queryFn();
    expect(result.markdown).toBe('# hi');
    expect(result.updatedAt).toBeNull();
    expect(client.post).toHaveBeenCalledWith('/v3/workspaces/ws/peers/p/representation', { max_conclusions: null });
  });
});
