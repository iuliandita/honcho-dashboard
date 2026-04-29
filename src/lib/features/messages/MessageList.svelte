<script lang="ts">
import EmptyArchive from '$ui/ascii/EmptyArchive.svelte';
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import ErrorState from '$ui/primitives/ErrorState.svelte';
import type { InfiniteData } from '@tanstack/query-core';
import type { CreateInfiniteQueryResult } from '@tanstack/svelte-query';
import { getContext, onMount } from 'svelte';
import MessageBubble from './MessageBubble.svelte';
import type { Message, MessagesPage } from './api';

interface Props {
  /** TanStack infinite query store. */
  query: CreateInfiniteQueryResult<InfiniteData<MessagesPage>, Error>;
  peerId: string;
}

const { query, peerId }: Props = $props();
const settings = getContext<AppSettings>('app-settings');

// Honcho returns newest-first pages; keep the first page's newest item visible
// while prepending older pages above it as scrollback loads.
const messages = $derived.by((): Message[] => {
  const pages = $query.data?.pages ?? [];
  return [...pages].reverse().flatMap((page) => [...page.messages].reverse());
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex (scrollable log region must be keyboard focusable) -->
<div
  class="message-list pane-body"
  role="log"
  aria-label={t(settings.locale, 'messages.log')}
  aria-live="polite"
  tabindex="0"
  onscroll={onScroll}
>
  {#if $query.isLoading && messages.length === 0}
    <p class="state-row" role="status">{t(settings.locale, 'messages.loading')}</p>
  {:else if $query.isError}
    <div class="state-block">
      <ErrorState
        error={$query.error}
        title={t(settings.locale, 'messages.failed')}
        context={`${t(settings.locale, 'common.peer')} ${peerId}`}
        onRetry={() => $query.refetch()}
      />
    </div>
  {:else if messages.length === 0}
    <EmptyState title={t(settings.locale, 'messages.empty')}>
      {#snippet art()}<EmptyArchive />{/snippet}
    </EmptyState>
  {:else}
    <div bind:this={topSentinel} class="sentinel" aria-hidden="true">
      {#if $query.isFetchingNextPage}
        <p class="state-row">{t(settings.locale, 'messages.loadingOlder')}</p>
      {/if}
      {#if !$query.hasNextPage}
        <p class="state-row faint">{t(settings.locale, 'messages.startOfHistory')}</p>
      {/if}
    </div>
    {#each messages as message (message.id)}
      <MessageBubble {message} {peerId} />
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
  .state-block {
    padding: 1rem;
  }
  .state-row.faint {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
  }
</style>
