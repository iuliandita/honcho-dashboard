<script lang="ts">
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import TopicChip from '$features/representation/TopicChip.svelte';
import EmptyArchive from '$ui/ascii/EmptyArchive.svelte';
import EmptySearch from '$ui/ascii/EmptySearch.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import ErrorState from '$ui/primitives/ErrorState.svelte';
import type { CreateQueryResult } from '@tanstack/svelte-query';
import ResultCard from './ResultCard.svelte';
import type { SearchResponse, SearchResult } from './api';
import { getContext } from 'svelte';

interface Props {
  /** Resolves a result to a clickable URL. Mode-specific (pinned vs picker). */
  hrefForResult: (result: SearchResult) => string;
  query: string;
  selectedTopic: string | null;
  onTopicChange: (topic: string | null) => void;
  queryStore: CreateQueryResult<SearchResponse, Error>;
}

const { hrefForResult, query, selectedTopic, onTopicChange, queryStore }: Props = $props();
const settings = getContext<AppSettings>('app-settings');
</script>

<div class="search-results">
  {#if !query.trim()}
    <EmptyState
      title={t(settings.locale, 'search.emptyQuery')}
      description={t(settings.locale, 'search.emptyQuery.description')}
    >
      {#snippet art()}<EmptySearch />{/snippet}
    </EmptyState>
  {:else if $queryStore.isLoading}
    <p class="state">{t(settings.locale, 'search.loading')}</p>
  {:else if $queryStore.isError}
    <ErrorState
      error={$queryStore.error}
      title={t(settings.locale, 'search.failed')}
      context={query}
      onRetry={() => $queryStore.refetch()}
    />
  {:else if $queryStore.data}
    {#if $queryStore.data.topicFacets && Object.keys($queryStore.data.topicFacets).length > 0}
      <nav class="facets" aria-label={t(settings.locale, 'search.topicFilter')}>
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
        title={t(settings.locale, 'search.empty')}
        description={selectedTopic
          ? t(settings.locale, 'search.emptyTopic.description', { query, topic: selectedTopic })
          : t(settings.locale, 'search.empty.description', { query })}
      >
        {#snippet art()}<EmptyArchive />{/snippet}
      </EmptyState>
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

</style>
