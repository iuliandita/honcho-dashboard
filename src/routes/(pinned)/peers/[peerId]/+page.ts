import { createApiClient } from '$api/client';
import { buildSessionsQuery } from '$features/browser/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { workspaceId, peerId } = await parent();
  const client = createApiClient({ fetch });
  const query = buildSessionsQuery(client, workspaceId, peerId);
  const sessions = await query.queryFn();
  return { sessions };
};
