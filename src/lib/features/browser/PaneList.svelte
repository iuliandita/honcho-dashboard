<script lang="ts" generics="T extends { id: string }">
import type { HonchoApiError } from '$api/errors';
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import ErrorState from '$ui/primitives/ErrorState.svelte';
import { getContext, type Snippet } from 'svelte';

interface Props {
  items: T[];
  selectedId?: string | null;
  empty: { title: string; description?: string };
  loading?: boolean;
  error?: HonchoApiError | { message: string } | null;
  /** Render snippet for each row. Receives the item and a `selected` boolean. */
  row?: Snippet<[T, boolean]>;
  /** Optional href builder for rows that navigate. */
  hrefFor?: (item: T) => string;
  /** Optional click handler - receives the row's item. */
  onSelect?: (item: T) => void;
  /** Optional retry handler for failed list loads. */
  onRetry?: () => void;
}

const {
  items,
  selectedId = null,
  empty,
  loading = false,
  error = null,
  row,
  hrefFor,
  onSelect,
  onRetry,
}: Props = $props();
const settings = getContext<AppSettings>('app-settings');
</script>

<div class="pane-body">
  {#if loading && items.length === 0}
    <p class="state-row" role="status">{t(settings.locale, 'state.loading')}...</p>
  {:else if error}
    <div class="state-block">
      <ErrorState {error} context={empty.title} {onRetry} />
    </div>
  {:else if items.length === 0}
    <EmptyState title={empty.title} description={empty.description} />
  {:else}
    <ul class="list" aria-label={empty.title}>
      {#each items as item (item.id)}
        <li>
          {#if hrefFor}
            <a
              class="row"
              class:selected={item.id === selectedId}
              href={hrefFor(item)}
              aria-current={item.id === selectedId ? 'page' : undefined}
            >
              {#if row}
                {@render row(item, item.id === selectedId)}
              {:else}
                <span>{item.id}</span>
              {/if}
            </a>
          {:else if onSelect}
            <button type="button" class="row" class:selected={item.id === selectedId} onclick={() => onSelect(item)}>
              {#if row}
                {@render row(item, item.id === selectedId)}
              {:else}
                <span>{item.id}</span>
              {/if}
            </button>
          {:else}
            <div class="row" class:selected={item.id === selectedId}>
              {#if row}
                {@render row(item, item.id === selectedId)}
              {:else}
                <span>{item.id}</span>
              {/if}
            </div>
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
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--color-border);
    border-top: 0;
    border-left: 0;
    border-right: 0;
    cursor: pointer;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: inherit;
    text-decoration: none;
  }
  .row:hover {
    background: var(--color-surface);
  }
  .row:focus-visible {
    outline: 2px solid var(--color-yellow-500);
    outline-offset: -2px;
  }
  .row.selected {
    background: color-mix(in oklab, var(--color-yellow-500) 10%, var(--color-surface));
    outline: 1px solid var(--color-yellow-500);
    outline-offset: -1px;
  }
  .state-row {
    padding: 1rem;
    color: var(--color-fg-muted);
  }
  .state-block {
    padding: 1rem;
  }
</style>
