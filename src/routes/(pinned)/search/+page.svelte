<script lang="ts">
import { replaceState } from '$app/navigation';
import { page } from '$app/state';
import { createApiClient } from '$api/client';
import { buildWorkspaceSearchQuery, type SearchResult } from '$features/search/api';
import SearchInput from '$features/search/SearchInput.svelte';
import SearchResults from '$features/search/SearchResults.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();

// URL load data seeds interactive local state once for this route.
// svelte-ignore state_referenced_locally
let inputValue = $state(data.initialQuery);
// svelte-ignore state_referenced_locally
let committedQuery = $state(data.initialQuery);
// svelte-ignore state_referenced_locally
let selectedTopic = $state<string | null>(data.initialTopic);

const client = createApiClient();
const hydratedInitialData = $derived(
  committedQuery === data.initialQuery && selectedTopic === data.initialTopic ? data.initialResponse : null,
);
// initialData is a one-shot hydration value; the snapshot is intentional.
// svelte-ignore state_referenced_locally
const query = $derived.by(() =>
  createQuery({
    ...buildWorkspaceSearchQuery(client, data.workspaceId, committedQuery, selectedTopic),
    initialData: hydratedInitialData ?? undefined,
  }),
);

function syncUrl(q: string, topic: string | null) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q);
  if (topic) params.set('topic', topic);
  const search = params.toString();
  const url = search ? `${page.url.pathname}?${search}` : page.url.pathname;
  replaceState(url, page.state);
}

function commit(q: string) {
  committedQuery = q;
  if (!q.trim()) selectedTopic = null;
  syncUrl(q, selectedTopic);
}

function setTopic(topic: string | null) {
  selectedTopic = topic;
  syncUrl(committedQuery, topic);
}

function hrefForResult(result: SearchResult): string {
  return `/peers/${result.peerId}`;
}
</script>

<Pane scrollable>
  <PaneHeader title="search" subtitle="workspace {data.workspaceId}" />
  <div class="search-route">
    <SearchInput bind:value={inputValue} onCommit={commit} />
    <SearchResults
      query={committedQuery}
      selectedTopic={selectedTopic}
      onTopicChange={setTopic}
      queryStore={query}
      hrefForResult={hrefForResult}
    />
  </div>
</Pane>

<style>
  .search-route {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 1rem;
  }
</style>
