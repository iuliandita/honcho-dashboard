<script lang="ts">
import { t } from '$lib/i18n';
import { getLocaleContext } from '$lib/settings/context';
import EmptyMemory from '$ui/ascii/EmptyMemory.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import RepresentationCard from './RepresentationCard.svelte';
import TopicChip from './TopicChip.svelte';
import type { RepresentationResponse } from './api';
import { filterByTopic } from './filter';

interface Props {
  data: RepresentationResponse;
}

const { data }: Props = $props();
const settings = getLocaleContext();
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
const latestCreatedAt = $derived.by(() => {
  const timestamps = filtered
    .map((item) => item.createdAt)
    .filter(Boolean)
    .sort();
  return timestamps.at(-1) ?? '';
});
const topicLabel = $derived(selectedTopic ?? 'all topics');
const focusedCount = $derived(`${filtered.length} / ${data.items.length}`);
const latestLabel = $derived(latestCreatedAt ? latestCreatedAt.slice(0, 16).replace('T', ' ') : '-');

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
    <div class="content-layout">
      <aside class="topic-context" aria-label="selected topic context">
        <dl>
          <div>
            <dt>selected topic</dt>
            <dd>{topicLabel}</dd>
          </div>
          <div>
            <dt>visible cards</dt>
            <dd>{focusedCount}</dd>
          </div>
          <div>
            <dt>latest item</dt>
            <dd>{latestLabel}</dd>
          </div>
          <div>
            <dt>known topics</dt>
            <dd>{topics.length}</dd>
          </div>
        </dl>
      </aside>

      <div class="grid">
        {#each filtered as item (item.id)}
          <RepresentationCard {item} />
        {/each}
      </div>
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
  .content-layout {
    display: grid;
    gap: 0.75rem;
  }
  .topic-context {
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    padding: 0.75rem 0;
  }
  .topic-context dl {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem 1rem;
  }
  .topic-context div {
    min-width: 0;
  }
  .topic-context dt {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
    text-transform: uppercase;
  }
  .topic-context dd {
    margin: 0.15rem 0 0 0;
    color: var(--color-fg);
    font-size: var(--text-sm);
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(28rem, 100%), 1fr));
    gap: 0.75rem;
  }

  @media (min-width: 72rem) {
    .content-layout {
      grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr);
      align-items: start;
    }
    .topic-context {
      position: sticky;
      top: 1rem;
    }
    .topic-context dl {
      grid-template-columns: 1fr;
    }
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
