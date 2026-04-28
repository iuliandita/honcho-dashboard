<script lang="ts">
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();
</script>

<div class="ws-chrome">
  <p class="trail">
    <a href="/workspaces">workspaces</a> · <code>{data.workspaceId}</code>
  </p>
  {@render children()}
</div>

<style>
  .ws-chrome {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 0;
    flex: 1;
  }
  .trail {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-fg-muted);
  }
  .trail a {
    color: var(--color-yellow-500);
    text-decoration: none;
  }
  .trail a:hover {
    text-decoration: underline;
  }
  .trail code {
    color: var(--color-fg);
  }
</style>
