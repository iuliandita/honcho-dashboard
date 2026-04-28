import { createApiClient } from '$api/client';
import { buildPeerRepresentationQuery } from '$features/representation/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { workspaceId, peerId } = await parent();
  const client = createApiClient({ fetch });
  const query = buildPeerRepresentationQuery(client, workspaceId, peerId);
  const representation = await query.queryFn();
  return { representation };
};
