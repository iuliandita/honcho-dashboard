<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<section class="picker-mode">
  <p class="muted">picker mode · no workspace pinned</p>
  {@render children()}
</section>

<style>
  .picker-mode {
    display: contents;
  }
  .muted {
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
    margin: 0 0 1rem 0;
  }
</style>
