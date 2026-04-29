import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import type { QueryContext } from '$api/query';
import { fetchPeerRepresentation } from '$features/representation/api';

export interface ProfileResponse {
  markdown: string;
  updatedAt: string | null;
}

export function buildPeerProfileQuery(client: ApiClient, workspaceId: string, peerId: string) {
  return {
    queryKey: keys.peerProfile(workspaceId, peerId),
    queryFn: async ({ signal }: QueryContext = {}) => {
      const response = await fetchPeerRepresentation(client, workspaceId, peerId, signal);
      return { markdown: response.representation, updatedAt: null };
    },
  };
}
