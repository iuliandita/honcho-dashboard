<script lang="ts">
import { onDestroy } from 'svelte';
import { debounce } from './debounce';

interface Props {
  /** Bound input value (instant). */
  value: string;
  /** Debounced query; fires after user pauses typing. */
  onCommit: (query: string) => void;
  debounceMs?: number;
}

let { value = $bindable(''), onCommit, debounceMs = 250 }: Props = $props();

// The debounce wrapper is created once for this input's lifetime.
// svelte-ignore state_referenced_locally
const debounced = debounce((q: string) => onCommit(q), debounceMs);

onDestroy(() => debounced.cancel());

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  value = target.value;
  debounced(target.value);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    debounced.cancel();
    onCommit(value);
  } else if (e.key === 'Escape') {
    value = '';
    debounced.cancel();
    onCommit('');
  }
}
</script>

<label class="search-input">
  <span class="prompt" aria-hidden="true">&gt;</span>
  <input
    type="search"
    placeholder="search this workspace..."
    {value}
    oninput={handleInput}
    onkeydown={handleKeydown}
    autocomplete="off"
    spellcheck="false"
  />
  <span class="hint">enter to commit / esc to clear</span>
</label>

<style>
  .search-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  .search-input:focus-within {
    border-color: var(--color-yellow-500);
  }

  .prompt {
    color: var(--color-yellow-500);
    font-weight: 700;
  }

  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    color: var(--color-fg);
    font-family: inherit;
    font-size: var(--text-base);
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: var(--color-fg-faint);
  }

  .hint {
    display: none;
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
    text-transform: lowercase;
    white-space: nowrap;
  }

  @media (min-width: 36rem) {
    .hint {
      display: inline;
    }
  }
</style>
