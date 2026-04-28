<script lang="ts">
import EmptyState from '$ui/primitives/EmptyState.svelte';
import type { InfiniteData } from '@tanstack/query-core';
import type { CreateInfiniteQueryResult } from '@tanstack/svelte-query';
import { onMount } from 'svelte';
import MessageBubble from './MessageBubble.svelte';
import type { Message, MessagesPage } from './api';

interface Props {
  /** TanStack infinite query store. */
  query: CreateInfiniteQueryResult<InfiniteData<MessagesPage>, Error>;
}

const { query }: Props = $props();

// Honcho returns newest-first pages; keep the first page's newest item visible
// while prepending older pages above it as scrollback loads.
const messages = $derived.by((): Message[] => {
  const pages = $query.data?.pages ?? [];
  return pages.flatMap((page) => [...page.messages].reverse()).reverse();
});

// biome-ignore lint/style/useConst: bind:this assigns the element after mount.
let topSentinel: HTMLDivElement | undefined = $state();
let userScrolled = $state(false);

function fetchOlderIfAvailable() {
  if ($query.hasNextPage && !$query.isFetchingNextPage) {
    $query.fetchNextPage();
  }
}

function onScroll(event: Event) {
  userScrolled = true;
  const target = event.currentTarget as HTMLElement;
  if (target.scrollTop <= 4) fetchOlderIfAvailable();
}

onMount(() => {
  if (!topSentinel) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (userScrolled && entry.isIntersecting && $query.hasNextPage && !$query.isFetchingNextPage) {
          fetchOlderIfAvailable();
        }
      }
    },
    { rootMargin: '200px' },
  );
  observer.observe(topSentinel);
  return () => observer.disconnect();
});
</script>

<div class="message-list pane-body" role="log" aria-live="polite" onscroll={onScroll}>
  {#if $query.isLoading && messages.length === 0}
    <p class="state-row" role="status">loading messages…</p>
  {:else if $query.isError}
    <p class="state-row error" role="alert">error: {$query.error?.message}</p>
  {:else if messages.length === 0}
    <EmptyState title="no messages in this session" />
  {:else}
    <div bind:this={topSentinel} class="sentinel" aria-hidden="true">
      {#if $query.isFetchingNextPage}
        <p class="state-row">loading older…</p>
      {/if}
      {#if !$query.hasNextPage}
        <p class="state-row faint">— start of history —</p>
      {/if}
    </div>
    {#each messages as message (message.id)}
      <MessageBubble {message} />
    {/each}
  {/if}
</div>

<style>
  .message-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
  .sentinel {
    padding: 0.5rem 0;
    text-align: center;
  }
  .state-row {
    padding: 1rem;
    color: var(--color-fg-muted);
    text-align: center;
  }
  .state-row.error {
    color: var(--color-error);
  }
  .state-row.faint {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
  }
</style>
