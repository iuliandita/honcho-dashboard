import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import type { components } from '$lib/honcho/types';

export interface SearchResult {
  id: string;
  peerId: string;
  peerName: string;
  topic: string;
  excerpt: string;
  score: number;
  /** ISO timestamp the snippet was last touched. */
  updatedAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  topicFacets?: Record<string, number>;
}

interface QueryContext {
  signal?: AbortSignal;
}

const PAGE_SIZE = 50;

function metadataString(metadata: Record<string, unknown> | undefined, key: string): string | null {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function metadataNumber(metadata: Record<string, unknown> | undefined, key: string): number | null {
  const value = metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toSearchResult(message: components['schemas']['Message']): SearchResult {
  return {
    id: message.id,
    peerId: message.peer_id,
    peerName:
      metadataString(message.metadata, 'peer_name') ?? metadataString(message.metadata, 'name') ?? message.peer_id,
    topic: metadataString(message.metadata, 'topic') ?? 'general',
    excerpt: message.content,
    score: metadataNumber(message.metadata, 'score') ?? 1,
    updatedAt: message.created_at,
  };
}

function topicFacets(results: SearchResult[]): Record<string, number> {
  return results.reduce<Record<string, number>>((acc, result) => {
    acc[result.topic] = (acc[result.topic] ?? 0) + 1;
    return acc;
  }, {});
}

export function buildWorkspaceSearchQuery(client: ApiClient, workspaceId: string, query: string, topic: string | null) {
  const trimmedQuery = query.trim();
  const body: components['schemas']['MessageSearchOptions'] = {
    query: trimmedQuery,
    filters: topic ? { topic } : null,
    limit: PAGE_SIZE,
  };

  return {
    queryKey: keys.workspaceSearch(workspaceId, trimmedQuery, topic),
    queryFn: async ({ signal }: QueryContext = {}) => {
      const path = `/v3/workspaces/${workspaceId}/search`;
      const messages = await (signal
        ? client.post<components['schemas']['Message'][]>(path, body, undefined, { signal })
        : client.post<components['schemas']['Message'][]>(path, body));
      const results = messages.map(toSearchResult);
      return { results, topicFacets: topicFacets(results) };
    },
    enabled: trimmedQuery.length > 0,
    staleTime: 60_000,
  };
}
