import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import { DEFAULT_PAGE_SIZE, EMPTY_FILTER, postQuery } from '$api/query';
import type { components } from '$lib/honcho/types';
import { honchoApiPaths } from '$lib/routing/paths';
import type { QueryFunctionContext } from '@tanstack/query-core';

export type Message = components['schemas']['Message'];

export interface MessagesPage {
  messages: Message[];
  nextPage: number | null;
}

export function buildSessionMessagesQuery(client: ApiClient, workspaceId: string, peerId: string, sessionId: string) {
  type QueryKey = ReturnType<typeof keys.sessionMessages>;
  type QueryContext = { pageParam?: number } & Partial<QueryFunctionContext<QueryKey, number>>;

  return {
    queryKey: keys.sessionMessages(workspaceId, peerId, sessionId),
    queryFn: async ({ pageParam = 1, signal }: QueryContext = {}) => {
      const path = honchoApiPaths.sessionMessages(workspaceId, sessionId);
      const params = { page: pageParam, size: DEFAULT_PAGE_SIZE, reverse: true };
      const page = await postQuery<components['schemas']['Page_Message_']>(client, path, EMPTY_FILTER, params, signal);
      return {
        messages: page.items,
        nextPage: page.page < page.pages ? page.page + 1 : null,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (last: MessagesPage): number | undefined => last.nextPage ?? undefined,
  };
}
