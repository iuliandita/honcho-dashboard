import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';

export interface ProfileResponse {
  markdown: string;
  updatedAt: string | null;
}

export function buildPeerProfileQuery(client: ApiClient, workspaceId: string, peerId: string) {
  return {
    queryKey: keys.peerProfile(workspaceId, peerId),
    queryFn: () => client.get<ProfileResponse>(`/v3/workspaces/${workspaceId}/peers/${peerId}/profile`),
  };
}
