import { createApiClient } from '$api/client';
import { buildSessionMessagesQuery } from '$features/messages/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { workspaceId } = await parent();
  const client = createApiClient({ fetch });
  const query = buildSessionMessagesQuery(client, workspaceId, params.peerId, params.sessionId);
  const firstPage = await query.queryFn({
    pageParam: null,
    signal: new AbortController().signal,
    queryKey: query.queryKey,
    meta: undefined,
    direction: 'forward',
  });
  return { firstPage, sessionId: params.sessionId };
};
