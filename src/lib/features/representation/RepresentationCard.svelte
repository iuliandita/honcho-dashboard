<script lang="ts">
import { formatAbsolute } from '$features/messages/format';
import Icon from '$ui/pixel/Icon.svelte';
import type { RepresentationItem } from './api';

interface Props {
  item: RepresentationItem;
}

const { item }: Props = $props();
</script>

<article class="card">
  <header>
    <span class="topic"><Icon name="topic" size={12} /> {item.topic}</span>
    {#if item.confidence !== undefined}
      <span class="confidence">{(item.confidence * 100).toFixed(0)}%</span>
    {/if}
  </header>
  <p class="content">{item.content}</p>
  {#if item.createdAt}
    <footer>
      <span class="ts">{formatAbsolute(item.createdAt)}</span>
    </footer>
  {/if}
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .topic {
    color: var(--color-yellow-500);
    font-size: var(--text-xs);
    text-transform: uppercase;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .confidence {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }
  .content {
    margin: 0;
    color: var(--color-fg);
    font-size: var(--text-sm);
    line-height: 1.5;
  }
  footer {
    display: flex;
    justify-content: flex-end;
  }
  .ts {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }
</style>
