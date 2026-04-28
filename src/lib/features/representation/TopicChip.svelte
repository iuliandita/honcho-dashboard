<script lang="ts">
interface Props {
  topic: string | null;
  selected: boolean;
  count: number;
  onClick: (topic: string | null) => void;
}

const { topic, selected, count, onClick }: Props = $props();
const label = $derived(topic ?? 'all');
</script>

<button type="button" class="chip" class:selected onclick={() => onClick(topic)} aria-pressed={selected}>
  <span class="label">{label}</span>
  <span class="count">{count}</span>
</button>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 2rem;
    padding: 0.25rem 0.65rem;
    background: transparent;
    color: var(--color-fg-muted);
    border: 1px solid var(--color-border);
    border-radius: 0;
    font-family: inherit;
    font-size: var(--text-xs);
    text-transform: lowercase;
    cursor: pointer;
  }
  .chip:hover {
    color: var(--color-fg);
    border-color: var(--color-fg-muted);
  }
  .chip:focus-visible {
    outline: 2px solid var(--color-yellow-500);
    outline-offset: 2px;
  }
  .chip.selected {
    color: var(--color-yellow-500);
    border-color: var(--color-yellow-500);
    background: color-mix(in oklab, var(--color-yellow-500) 12%, transparent);
  }
  .count {
    color: var(--color-fg-faint);
    font-variant-numeric: tabular-nums;
  }
  .chip.selected .count {
    color: var(--color-yellow-700);
  }

  @media (pointer: coarse) {
    .chip {
      min-height: 2.75rem;
      padding-inline: 0.8rem;
    }
  }
</style>
