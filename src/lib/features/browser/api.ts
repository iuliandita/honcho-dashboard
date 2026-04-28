import type { ApiClient } from '$api/client';
import { keys } from '$api/keys';
import type { components } from '$lib/honcho/types';

export type WorkspaceSummary = components['schemas']['Workspace'];
export type PeerSummary = components['schemas']['Peer'];
export type SessionSummary = components['schemas']['Session'];

const PAGE_SIZE = 50;
const EMPTY_FILTER = { filters: null } as const;

interface PageEnvelope<T> {
  items: T[];
  page: number;
  pages: number;
}

interface QueryContext {
  signal?: AbortSignal;
}

async function fetchAllPages<T>(
  client: ApiClient,
  path: string,
  body: typeof EMPTY_FILTER,
  signal?: AbortSignal,
): Promise<T[]> {
  const items: T[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  do {
    const params = { page: pageNumber, size: PAGE_SIZE };
    const page = await (signal
      ? client.post<PageEnvelope<T>>(path, body, params, { signal })
      : client.post<PageEnvelope<T>>(path, body, params));
    items.push(...page.items);
    totalPages = page.pages;
    pageNumber = page.page + 1;
  } while (pageNumber <= totalPages);

  return items;
}

export function buildWorkspacesQuery(client: ApiClient) {
  return {
    queryKey: keys.allWorkspaces(),
    queryFn: ({ signal }: QueryContext = {}) =>
      fetchAllPages<WorkspaceSummary>(client, '/v3/workspaces/list', EMPTY_FILTER, signal),
  };
}

export function buildPeersQuery(client: ApiClient, workspaceId: string) {
  return {
    queryKey: [...keys.workspace(workspaceId), 'peers'] as const,
    queryFn: ({ signal }: QueryContext = {}) =>
      fetchAllPages<PeerSummary>(client, `/v3/workspaces/${workspaceId}/peers/list`, EMPTY_FILTER, signal),
  };
}

export function buildSessionsQuery(client: ApiClient, workspaceId: string, peerId: string) {
  return {
    queryKey: [...keys.peer(workspaceId, peerId), 'sessions'] as const,
    queryFn: ({ signal }: QueryContext = {}) =>
      fetchAllPages<SessionSummary>(
        client,
        `/v3/workspaces/${workspaceId}/peers/${peerId}/sessions`,
        EMPTY_FILTER,
        signal,
      ),
  };
}
