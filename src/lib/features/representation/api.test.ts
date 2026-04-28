import type { ApiClient } from '$api/client';
import { describe, expect, it, vi } from 'vitest';
import { type RepresentationResponse, buildPeerRepresentationQuery } from './api';

function mockClient<T>(data: T): ApiClient {
  return {
    get: vi.fn(async () => data) as ApiClient['get'],
    post: vi.fn(async () => data) as ApiClient['post'],
  };
}

describe('buildPeerRepresentationQuery', () => {
  it('keys by workspace+peer+representation', () => {
    const client = mockClient<RepresentationResponse>({ items: [], topics: [] });
    const opts = buildPeerRepresentationQuery(client, 'ws', 'p');

    expect(opts.queryKey).toEqual(['workspace', 'ws', 'peer', 'p', 'representation']);
  });

  it('POSTs the OpenAPI representation endpoint', async () => {
    const client = mockClient({ representation: 'prefers oat milk' });
    const opts = buildPeerRepresentationQuery(client, 'ws', 'p');
    const result = await opts.queryFn();

    expect(result.items).toEqual([
      {
        id: 'representation-1',
        topic: 'general',
        content: 'prefers oat milk',
        createdAt: '',
      },
    ]);
    expect(result.topics).toEqual(['general']);
    expect(client.post).toHaveBeenCalledWith('/v3/workspaces/ws/peers/p/representation', { max_conclusions: null });
  });

  it('normalizes markdown headings into topic cards', async () => {
    const client = mockClient({
      representation: '## coffee\n- prefers oat milk\n- medium roast\n\n## sleep\nlate riser',
    });
    const opts = buildPeerRepresentationQuery(client, 'ws', 'p');
    const result = await opts.queryFn();

    expect(result.topics).toEqual(['coffee', 'sleep']);
    expect(result.items.map((item) => [item.topic, item.content])).toEqual([
      ['coffee', 'prefers oat milk'],
      ['coffee', 'medium roast'],
      ['sleep', 'late riser'],
    ]);
  });

  it('passes through already-normalized representation data', async () => {
    const normalized: RepresentationResponse = {
      items: [
        {
          id: 'r1',
          topic: 'coffee',
          content: 'likes oat milk',
          confidence: 0.9,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      topics: ['coffee'],
    };
    const client = mockClient(normalized);
    const opts = buildPeerRepresentationQuery(client, 'ws', 'p');

    expect(await opts.queryFn()).toEqual(normalized);
  });
});
