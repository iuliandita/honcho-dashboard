<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  children: Snippet;
  /** When true, the pane scrolls its own content (for long lists). */
  scrollable?: boolean;
}

const { children, scrollable = false }: Props = $props();
</script>

<section class="pane" class:scrollable>
  {@render children()}
</section>

<style>
  .pane {
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 0;
    overflow: hidden;
    min-height: 0;
  }
  .pane.scrollable :global(.pane-body) {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
</style>
