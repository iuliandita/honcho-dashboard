<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  title: string;
  /** Optional secondary line. */
  description?: string;
  /** Optional ASCII art slot. If omitted, no art renders. */
  art?: Snippet;
}

const { title, description, art }: Props = $props();
</script>

<div class="empty-state" role="status">
  {#if art}
    <div class="art" aria-hidden="true">{@render art()}</div>
  {/if}
  <p class="title">{title}</p>
  {#if description}<p class="description">{description}</p>{/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem 1rem;
    color: var(--color-fg-muted);
  }
  .art {
    color: var(--color-yellow-500);
    font-size: var(--text-xs);
    line-height: 1.2;
  }
  .title {
    margin: 0;
    color: var(--color-fg);
  }
  .description {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-fg-faint);
    text-align: center;
    max-width: 40ch;
  }
</style>
