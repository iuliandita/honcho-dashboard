import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';

export interface WorkspaceSummary {
  id: string;
  name: string;
}

export interface PeerSummary {
  id: string;
  name: string;
}

export interface SessionSummary {
  id: string;
  /** ISO timestamp of last activity, if available. */
  updatedAt?: string;
  messageCount?: number;
}

/**
 * Honcho v3 list endpoints are POST with a filter body. We pass an empty
 * filter to fetch all rows visible to the admin token. Pagination is deferred
 * to a later plan — v1 accepts whatever the server returns in one page.
 */
export function buildWorkspacesQuery(client: ApiClient) {
  return {
    queryKey: keys.allWorkspaces(),
    queryFn: () => client.post<WorkspaceSummary[]>('/v3/workspaces/list', {}),
  };
}

export function buildPeersQuery(client: ApiClient, workspaceId: string) {
  return {
    queryKey: [...keys.workspace(workspaceId), 'peers'] as const,
    queryFn: () => client.post<PeerSummary[]>(`/v3/workspaces/${workspaceId}/peers/list`, {}),
  };
}

export function buildSessionsQuery(client: ApiClient, workspaceId: string, peerId: string) {
  return {
    queryKey: [...keys.peer(workspaceId, peerId), 'sessions'] as const,
    queryFn: () => client.post<SessionSummary[]>(`/v3/workspaces/${workspaceId}/peers/${peerId}/sessions`, {}),
  };
}
