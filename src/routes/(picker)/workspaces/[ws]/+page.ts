import { createApiClient } from '$api/client';
import { buildPeersQuery } from '$features/browser/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const client = createApiClient({ fetch });
  const query = buildPeersQuery(client, params.ws);
  const peers = await query.queryFn();
  return { peers };
};
