import { createApiClient } from '$api/client';
import { buildPeersQuery } from '$features/browser/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { workspaceId } = await parent();
  const client = createApiClient({ fetch });
  const query = buildPeersQuery(client, workspaceId);
  const peers = await query.queryFn();
  return { peers, workspaceId };
};
