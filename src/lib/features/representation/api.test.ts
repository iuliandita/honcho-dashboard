import { describe, expect, it } from 'vitest';
import { mockClient } from '../../../../tests/lib/test-utils';
import { type RepresentationResponse, buildPeerRepresentationQuery } from './api';

describe('buildPeerRepresentationQuery', () => {
  it('keys by workspace+peer+representation', () => {
    const client = mockClient({ representation: '' });
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

  it('preserves topic order across nested headings and blank lines', async () => {
    const client = mockClient({
      representation: '# profile\n\n## coffee\n- oat milk\n\n### roast\nmedium roast\n\n## sleep\nlate riser',
    });
    const opts = buildPeerRepresentationQuery(client, 'ws', 'p');
    const result = await opts.queryFn();

    expect(result.topics).toEqual(['coffee', 'roast', 'sleep']);
    expect(result.items.map((item) => [item.topic, item.content])).toEqual([
      ['coffee', 'oat milk'],
      ['roast', 'medium roast'],
      ['sleep', 'late riser'],
    ]);
  });

  it('returns empty items for an empty OSS representation', async () => {
    const client = mockClient({ representation: '' });
    const opts = buildPeerRepresentationQuery(client, 'ws', 'p');

    expect(await opts.queryFn()).toEqual({ items: [], topics: [] });
  });

  it('returns empty items for an unknown representation shape', async () => {
    const client = mockClient({ unexpected: 'shape' });
    const opts = buildPeerRepresentationQuery(client, 'ws', 'p');

    expect(await opts.queryFn()).toEqual({ items: [], topics: [] });
  });
});
