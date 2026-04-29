import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import { type QueryContext, fetchAllPages } from '$api/query';
import type { components } from '$lib/honcho/types';
import { honchoApiPaths } from '$lib/routing/paths';

export type WorkspaceSummary = components['schemas']['Workspace'];
export type PeerSummary = components['schemas']['Peer'];
export type SessionSummary = components['schemas']['Session'];

export function buildWorkspacesQuery(client: ApiClient) {
  return {
    queryKey: keys.allWorkspaces(),
    queryFn: ({ signal }: QueryContext = {}) => fetchAllPages<WorkspaceSummary>(client, '/v3/workspaces/list', signal),
  };
}

export function buildPeersQuery(client: ApiClient, workspaceId: string) {
  return {
    queryKey: [...keys.workspace(workspaceId), 'peers'] as const,
    queryFn: ({ signal }: QueryContext = {}) =>
      fetchAllPages<PeerSummary>(client, honchoApiPaths.peersList(workspaceId), signal),
  };
}

export function buildSessionsQuery(client: ApiClient, workspaceId: string, peerId: string) {
  return {
    queryKey: [...keys.peer(workspaceId, peerId), 'sessions'] as const,
    queryFn: ({ signal }: QueryContext = {}) =>
      fetchAllPages<SessionSummary>(client, honchoApiPaths.sessionsForPeer(workspaceId, peerId), signal),
  };
}
