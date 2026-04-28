<script lang="ts">
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();
</script>

<section class="pinned-mode">
  <p class="muted">pinned mode · workspace <code>{data.workspaceId}</code></p>
  {@render children()}
</section>

<style>
  .pinned-mode {
    display: contents;
  }
  .muted {
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
    margin: 0 0 1rem 0;
  }
  code {
    color: var(--color-yellow-500);
  }
</style>
