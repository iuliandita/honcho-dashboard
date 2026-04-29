import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import type { components } from '$lib/honcho/types';
import { honchoApiPaths } from '$lib/routing/paths';

export interface ProfileResponse {
  markdown: string;
  updatedAt: string | null;
}

interface QueryContext {
  signal?: AbortSignal;
}

export function buildPeerProfileQuery(client: ApiClient, workspaceId: string, peerId: string) {
  return {
    queryKey: keys.peerProfile(workspaceId, peerId),
    queryFn: async ({ signal }: QueryContext = {}) => {
      const body: components['schemas']['PeerRepresentationGet'] = { max_conclusions: null };
      const path = honchoApiPaths.peerRepresentation(workspaceId, peerId);
      const response = await (signal
        ? client.post<components['schemas']['RepresentationResponse']>(path, body, undefined, { signal })
        : client.post<components['schemas']['RepresentationResponse']>(path, body));
      return { markdown: response.representation, updatedAt: null };
    },
  };
}
