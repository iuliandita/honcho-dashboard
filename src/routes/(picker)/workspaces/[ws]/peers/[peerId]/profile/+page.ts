import { createApiClient } from '$api/client';
import { buildPeerProfileQuery } from '$features/profile/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { workspaceId, peerId } = await parent();
  const client = createApiClient({ fetch });
  const query = buildPeerProfileQuery(client, workspaceId, peerId);
  const profile = await query.queryFn();
  return { profile };
};
