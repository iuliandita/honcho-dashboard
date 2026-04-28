import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import type { components } from '$lib/honcho/types';
import type { QueryFunctionContext } from '@tanstack/query-core';

export type Message = components['schemas']['Message'];

export interface MessagesPage {
  messages: Message[];
  nextPage: number | null;
}

const PAGE_SIZE = 50;
const EMPTY_FILTER: components['schemas']['MessageGet'] = { filters: null };

export function buildSessionMessagesQuery(client: ApiClient, workspaceId: string, peerId: string, sessionId: string) {
  type QueryKey = ReturnType<typeof keys.sessionMessages>;
  type QueryContext = { pageParam: number } & Partial<QueryFunctionContext<QueryKey, number>>;

  return {
    queryKey: keys.sessionMessages(workspaceId, peerId, sessionId),
    queryFn: async ({ pageParam }: QueryContext) => {
      const pageNumber = pageParam ?? 1;
      const page = await client.post<components['schemas']['Page_Message_']>(
        `/v3/workspaces/${workspaceId}/sessions/${sessionId}/messages/list`,
        EMPTY_FILTER,
        { page: pageNumber, size: PAGE_SIZE, reverse: true },
      );
      return {
        messages: page.items,
        nextPage: page.page < page.pages ? page.page + 1 : null,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (last: MessagesPage): number | undefined => last.nextPage ?? undefined,
  };
}
