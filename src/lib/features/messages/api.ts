import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import type { QueryFunctionContext } from '@tanstack/query-core';

export interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface MessagesPage {
  messages: Message[];
  /** Cursor for the next older page; null when history is exhausted. */
  cursor: string | null;
}

const PAGE_SIZE = 50;

export function buildSessionMessagesQuery(client: ApiClient, workspaceId: string, peerId: string, sessionId: string) {
  type QueryKey = ReturnType<typeof keys.sessionMessages>;
  type QueryContext = { pageParam: string | null } & Partial<QueryFunctionContext<QueryKey, string | null>>;

  return {
    queryKey: keys.sessionMessages(workspaceId, peerId, sessionId),
    queryFn: ({ pageParam }: QueryContext) => {
      const params: Record<string, string | number> = { limit: PAGE_SIZE };
      if (pageParam) params.cursor = pageParam;
      return client.get<MessagesPage>(
        `/v3/workspaces/${workspaceId}/peers/${peerId}/sessions/${sessionId}/messages`,
        params,
      );
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last: MessagesPage): string | undefined => last.cursor ?? undefined,
  };
}
