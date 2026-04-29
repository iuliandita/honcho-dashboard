<script lang="ts">
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import EmptyMemory from '$ui/ascii/EmptyMemory.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import RepresentationCard from './RepresentationCard.svelte';
import TopicChip from './TopicChip.svelte';
import type { RepresentationResponse } from './api';
import { filterByTopic } from './filter';
import { getContext } from 'svelte';

interface Props {
  data: RepresentationResponse;
}

const { data }: Props = $props();
const settings = getContext<AppSettings>('app-settings');
let selectedTopic = $state<string | null>(null);

const topicCounts = $derived.by((): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const item of data.items) {
    counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1);
  }
  return counts;
});

const topics = $derived(data.topics.length > 0 ? data.topics : [...topicCounts.keys()]);
const filtered = $derived(filterByTopic(data.items, selectedTopic));

function setTopic(topic: string | null) {
  selectedTopic = topic;
}
</script>

<div class="representation">
  <nav class="filter-bar" aria-label={t(settings.locale, 'search.topicFilter')}>
    <TopicChip topic={null} selected={selectedTopic === null} count={data.items.length} onClick={setTopic} />
    {#each topics as topic (topic)}
      <TopicChip {topic} selected={selectedTopic === topic} count={topicCounts.get(topic) ?? 0} onClick={setTopic} />
    {/each}
  </nav>

  {#if filtered.length === 0}
    <EmptyState
      title={selectedTopic === null
        ? t(settings.locale, 'representation.emptyYet')
        : t(settings.locale, 'representation.emptyForTopic', { topic: selectedTopic })}
      description={t(settings.locale, 'representation.empty.description')}
    >
      {#snippet art()}<EmptyMemory />{/snippet}
    </EmptyState>
  {:else}
    <div class="grid">
      {#each filtered as item (item.id)}
        <RepresentationCard {item} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .representation {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(28rem, 100%), 1fr));
    gap: 0.75rem;
  }
</style>
