import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';

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
  /** Optional facet counts per topic, if Honcho returns them. */
  topicFacets?: Record<string, number>;
}

const PAGE_SIZE = 50;

export function buildWorkspaceSearchQuery(client: ApiClient, workspaceId: string, query: string, topic: string | null) {
  const trimmedQuery = query.trim();
  const params: Record<string, string | number> = { q: trimmedQuery, limit: PAGE_SIZE };
  if (topic) params.topic = topic;

  return {
    queryKey: keys.workspaceSearch(workspaceId, trimmedQuery, topic),
    queryFn: () => client.get<SearchResponse>(`/v3/workspaces/${workspaceId}/search`, params),
    enabled: trimmedQuery.length > 0,
    staleTime: 60_000,
  };
}
