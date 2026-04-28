<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  title: string;
  subtitle?: string;
  actions?: Snippet;
}

const { title, subtitle, actions }: Props = $props();
</script>

<header class="pane-header">
  <div class="text">
    <h2>{title}</h2>
    {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
  </div>
  {#if actions}
    <div class="actions">{@render actions()}</div>
  {/if}
</header>

<style>
  .pane-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }
  h2 {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--color-yellow-500);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .subtitle {
    margin: 0.15rem 0 0 0;
    font-size: var(--text-xs);
    color: var(--color-fg-muted);
  }
  .actions {
    display: flex;
    gap: 0.5rem;
  }
</style>
