<script lang="ts">
import TopicChip from '$features/representation/TopicChip.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import type { CreateQueryResult } from '@tanstack/svelte-query';
import type { SearchResponse, SearchResult } from './api';
import ResultCard from './ResultCard.svelte';

interface Props {
  /** Resolves a result to a clickable URL. Mode-specific (pinned vs picker). */
  hrefForResult: (result: SearchResult) => string;
  query: string;
  selectedTopic: string | null;
  onTopicChange: (topic: string | null) => void;
  queryStore: CreateQueryResult<SearchResponse, Error>;
}

const { hrefForResult, query, selectedTopic, onTopicChange, queryStore }: Props = $props();
</script>

<div class="search-results">
  {#if !query.trim()}
    <EmptyState title="type to search" description="searches across all peers in this workspace" />
  {:else if $queryStore.isLoading}
    <p class="state">searching...</p>
  {:else if $queryStore.isError}
    <p class="state error">error: {$queryStore.error?.message}</p>
  {:else if $queryStore.data}
    {#if $queryStore.data.topicFacets && Object.keys($queryStore.data.topicFacets).length > 0}
      <nav class="facets" aria-label="filter by topic">
        <TopicChip
          topic={null}
          selected={selectedTopic === null}
          count={Object.values($queryStore.data.topicFacets).reduce((a, b) => a + b, 0)}
          onClick={onTopicChange}
        />
        {#each Object.entries($queryStore.data.topicFacets) as [topic, count] (topic)}
          <TopicChip {topic} selected={selectedTopic === topic} {count} onClick={onTopicChange} />
        {/each}
      </nav>
    {/if}

    {#if $queryStore.data.results.length === 0}
      <EmptyState
        title="no results"
        description={selectedTopic
          ? `nothing for "${query}" under topic ${selectedTopic}`
          : `nothing for "${query}" in this workspace`}
      />
    {:else}
      <ol class="results">
        {#each $queryStore.data.results as result (result.id)}
          <li>
            <ResultCard {result} href={hrefForResult(result)} />
          </li>
        {/each}
      </ol>
    {/if}
  {/if}
</div>

<style>
  .search-results {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  .facets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .results {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }

  .state {
    padding: 1rem;
    color: var(--color-fg-muted);
  }

  .state.error {
    color: var(--color-error);
  }
</style>
