import type { ApiClient } from './client';

export const DEFAULT_PAGE_SIZE = 50;
export const EMPTY_FILTER = { filters: null } as const;

export interface QueryContext {
  signal?: AbortSignal;
}

export function postQuery<T>(
  client: ApiClient,
  path: string,
  body: unknown,
  params?: Record<string, string | number | boolean | null | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  if (signal) return client.post<T>(path, body, params, { signal });
  return params ? client.post<T>(path, body, params) : client.post<T>(path, body);
}

export async function fetchAllPages<T>(client: ApiClient, path: string, signal?: AbortSignal): Promise<T[]> {
  const items: T[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  do {
    const page = await postQuery<{ items: T[]; page: number; pages: number }>(
      client,
      path,
      EMPTY_FILTER,
      { page: pageNumber, size: DEFAULT_PAGE_SIZE },
      signal,
    );
    items.push(...page.items);
    totalPages = page.pages;
    pageNumber = page.page + 1;
  } while (pageNumber <= totalPages);

  return items;
}
