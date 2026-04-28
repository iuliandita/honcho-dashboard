import { createApiClient } from '$api/client';
import { buildWorkspaceSearchQuery } from '$features/search/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url, parent }) => {
  const { workspaceId } = await parent();
  const q = url.searchParams.get('q') ?? '';
  const topic = url.searchParams.get('topic') || null;

  let initialResponse = null;
  if (q.trim()) {
    const client = createApiClient({ fetch });
    const query = buildWorkspaceSearchQuery(client, workspaceId, q, topic);
    initialResponse = await query.queryFn();
  }

  return { initialQuery: q, initialTopic: topic, initialResponse };
};
