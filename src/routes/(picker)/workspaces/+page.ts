import { createApiClient } from '$api/client';
import { buildWorkspacesQuery } from '$features/browser/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const client = createApiClient({ fetch });
  const query = buildWorkspacesQuery(client);
  const workspaces = await query.queryFn();
  return { workspaces };
};
