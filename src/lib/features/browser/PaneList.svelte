<script lang="ts" generics="T extends { id: string }">
import type { HonchoApiError } from '$api/errors';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import type { Snippet } from 'svelte';

interface Props {
  items: T[];
  selectedId?: string | null;
  empty: { title: string; description?: string };
  loading?: boolean;
  error?: HonchoApiError | { message: string } | null;
  /** Render snippet for each row. Receives the item and a `selected` boolean. */
  row?: Snippet<[T, boolean]>;
  /** Optional click handler — receives the row's item. */
  onSelect?: (item: T) => void;
}

const { items, selectedId = null, empty, loading = false, error = null, row, onSelect }: Props = $props();
</script>

<div class="pane-body">
  {#if loading && items.length === 0}
    <p class="state-row" role="status">loading…</p>
  {:else if error}
    <p class="state-row error" role="alert">
      <span>error: {error.message}</span>
    </p>
  {:else if items.length === 0}
    <EmptyState title={empty.title} description={empty.description} />
  {:else}
    <ul class="list" role="listbox" aria-label={empty.title}>
      {#each items as item (item.id)}
        <li
          class="row"
          class:selected={item.id === selectedId}
          tabindex="0"
          role="option"
          aria-selected={item.id === selectedId}
          onclick={() => onSelect?.(item)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(item)}
        >
          {#if row}
            {@render row(item, item.id === selectedId)}
          {:else}
            <span>{item.id}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .pane-body {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
  .row {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    background: transparent;
  }
  .row:hover {
    background: var(--color-surface);
  }
  .row:focus-visible {
    outline: 2px solid var(--color-yellow-500);
    outline-offset: -2px;
  }
  .row.selected {
    background: var(--color-surface);
    border-left: 3px solid var(--color-yellow-500);
    padding-left: calc(1rem - 3px);
  }
  .state-row {
    padding: 1rem;
    color: var(--color-fg-muted);
  }
  .state-row.error {
    color: var(--color-error);
  }
</style>
