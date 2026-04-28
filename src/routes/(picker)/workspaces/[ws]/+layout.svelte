<script lang="ts">
import { page } from '$app/state';
import Icon from '$ui/pixel/Icon.svelte';
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();

const searchHref = $derived(`/workspaces/${data.workspaceId}/search`);
const isSearch = $derived(page.url.pathname === searchHref);
</script>

<div class="ws-chrome">
  <nav class="ws-nav" aria-label="workspace">
    <p class="trail">
      <a href="/workspaces">workspaces</a> · <code>{data.workspaceId}</code>
    </p>
    <a class="search-link" class:active={isSearch} href={searchHref}>
      <Icon name="search" size={12} />
      <span>search</span>
    </a>
  </nav>
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

  .ws-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
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

  .search-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 2.75rem;
    padding: 0.25rem 0.75rem;
    color: var(--color-fg-muted);
    border: 1px solid transparent;
    text-decoration: none;
    font-size: var(--text-sm);
  }

  .search-link:hover {
    color: var(--color-fg);
    border-color: var(--color-border);
  }

  .search-link:focus-visible {
    outline: 2px solid var(--color-yellow-500);
    outline-offset: 2px;
  }

  .search-link.active {
    color: var(--color-yellow-500);
    border-color: var(--color-yellow-500);
  }
</style>
