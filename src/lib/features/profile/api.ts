import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import type { components } from '$lib/honcho/types';

export interface ProfileResponse {
  markdown: string;
  updatedAt: string | null;
}

export function buildPeerProfileQuery(client: ApiClient, workspaceId: string, peerId: string) {
  return {
    queryKey: keys.peerProfile(workspaceId, peerId),
    queryFn: async () => {
      const body: components['schemas']['PeerRepresentationGet'] = { max_conclusions: null };
      const response = await client.post<components['schemas']['RepresentationResponse']>(
        `/v3/workspaces/${workspaceId}/peers/${peerId}/representation`,
        body,
      );
      return { markdown: response.representation, updatedAt: null };
    },
  };
}
