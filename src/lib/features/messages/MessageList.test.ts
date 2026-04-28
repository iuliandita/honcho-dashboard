import type { InfiniteData } from '@tanstack/query-core';
import type { CreateInfiniteQueryResult } from '@tanstack/svelte-query';
import { fireEvent, render } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MessageList from './MessageList.svelte';
import type { Message, MessagesPage } from './api';

function message(id: string, content: string): Message {
  return {
    id,
    content,
    peer_id: 'peer-1',
    session_id: 'sess-1',
    workspace_id: 'ws-1',
    metadata: {},
    created_at: '2026-04-28T12:00:00Z',
    token_count: 1,
  };
}

function queryStore(overrides: Record<string, unknown> = {}) {
  return writable<Record<string, unknown>>({
    data: undefined,
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    ...overrides,
  });
}

function asQuery(query: ReturnType<typeof queryStore>): CreateInfiniteQueryResult<InfiniteData<MessagesPage>, Error> {
  return query as unknown as CreateInfiniteQueryResult<InfiniteData<MessagesPage>, Error>;
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  observe = vi.fn();
  disconnect = vi.fn();

  constructor(private callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting = true) {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe('<MessageList>', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  it('renders oldest loaded message first across newest-first pages', () => {
    const newestPage: MessagesPage = {
      messages: [message('m4', 'newest'), message('m3', 'newer')],
      nextPage: 2,
    };
    const olderPage: MessagesPage = {
      messages: [message('m2', 'older'), message('m1', 'oldest')],
      nextPage: null,
    };
    const query = queryStore({
      data: { pages: [newestPage, olderPage], pageParams: [1, 2] },
    });

    const { container } = render(MessageList, { props: { query: asQuery(query), peerId: 'peer-1' } });
    const text = container.textContent ?? '';

    expect(text.indexOf('oldest')).toBeLessThan(text.indexOf('older'));
    expect(text.indexOf('older')).toBeLessThan(text.indexOf('newer'));
    expect(text.indexOf('newer')).toBeLessThan(text.indexOf('newest'));
  });

  it('loads the next page when the user scrolls back to the top', async () => {
    const fetchNextPage = vi.fn();
    const query = queryStore({
      data: { pages: [{ messages: [message('m1', 'hello')], nextPage: 2 }], pageParams: [1] },
      fetchNextPage,
      hasNextPage: true,
    });
    const { getByRole } = render(MessageList, { props: { query: asQuery(query), peerId: 'peer-1' } });
    const log = getByRole('log');

    Object.defineProperty(log, 'scrollTop', { configurable: true, value: 0 });
    await fireEvent.scroll(log);

    expect(fetchNextPage).toHaveBeenCalledOnce();
  });

  it('gates intersection loading on user scroll and fetch state', async () => {
    const fetchNextPage = vi.fn();
    const query = queryStore({
      data: { pages: [{ messages: [message('m1', 'hello')], nextPage: 2 }], pageParams: [1] },
      fetchNextPage,
      hasNextPage: true,
    });
    const { getByRole } = render(MessageList, { props: { query: asQuery(query), peerId: 'peer-1' } });
    const observer = MockIntersectionObserver.instances[0];
    if (!observer) throw new Error('expected observer');

    observer.trigger();
    expect(fetchNextPage).not.toHaveBeenCalled();

    const log = getByRole('log');
    Object.defineProperty(log, 'scrollTop', { configurable: true, value: 12 });
    await fireEvent.scroll(log);
    observer.trigger();
    expect(fetchNextPage).toHaveBeenCalledOnce();

    query.set({
      data: { pages: [{ messages: [message('m1', 'hello')], nextPage: 2 }], pageParams: [1] },
      error: null,
      fetchNextPage,
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: true,
      isLoading: false,
    });
    observer.trigger();
    expect(fetchNextPage).toHaveBeenCalledOnce();
  });
});
