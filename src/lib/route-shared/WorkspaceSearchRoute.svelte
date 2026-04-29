<script lang="ts">
import { createApiClient } from '$api/client';
import { replaceState } from '$app/navigation';
import { page } from '$app/state';
import SearchInput from '$features/search/SearchInput.svelte';
import SearchResults from '$features/search/SearchResults.svelte';
import { type SearchResponse, type SearchResult, buildWorkspaceSearchQuery } from '$features/search/api';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';

interface Props {
  workspaceId: string;
  initialQuery: string;
  initialTopic: string | null;
  initialResponse: SearchResponse | null;
  peerHrefPrefix: string;
}

const { workspaceId, initialQuery, initialTopic, initialResponse, peerHrefPrefix }: Props = $props();

// svelte-ignore state_referenced_locally
let inputValue = $state(initialQuery);
// svelte-ignore state_referenced_locally
let committedQuery = $state(initialQuery);
// svelte-ignore state_referenced_locally
let selectedTopic = $state<string | null>(initialTopic);

const client = createApiClient();
const hydratedInitialData = $derived(
  committedQuery === initialQuery && selectedTopic === initialTopic ? initialResponse : null,
);
// svelte-ignore state_referenced_locally
const query = $derived.by(() =>
  createQuery({
    ...buildWorkspaceSearchQuery(client, workspaceId, committedQuery, selectedTopic),
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

function setInputValue(q: string) {
  inputValue = q;
}

function hrefForResult(result: SearchResult): string {
  return `${peerHrefPrefix}/${result.peerId}`;
}
</script>

<Pane scrollable>
  <PaneHeader title="search" subtitle="workspace {workspaceId}" />
  <div class="search-route">
    <SearchInput value={inputValue} onValueChange={setInputValue} onCommit={commit} />
    <SearchResults
      query={committedQuery}
      selectedTopic={selectedTopic}
      onTopicChange={(topic) => {
        selectedTopic = topic;
        syncUrl(committedQuery, topic);
      }}
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
