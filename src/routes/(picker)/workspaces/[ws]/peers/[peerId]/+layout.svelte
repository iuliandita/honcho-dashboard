<script lang="ts">
import { page } from '$app/state';
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();

const basePath = $derived(`/workspaces/${data.workspaceId}/peers/${data.peerId}`);
const tabs = [
  { id: 'sessions', label: 'sessions' },
  { id: 'representation', label: 'representation' },
  { id: 'profile', label: 'profile' },
  { id: 'chat', label: 'chat' },
] as const;

function hrefFor(tabId: string): string {
  return tabId === 'sessions' ? basePath : `${basePath}/${tabId}`;
}

function isActive(tabId: string): boolean {
  const path = page.url.pathname;
  if (tabId === 'sessions') return path === basePath || path.startsWith(`${basePath}/sessions`);
  return path.startsWith(`${basePath}/${tabId}`);
}
</script>

<div class="peer-chrome">
  <p class="trail">
    <a href="/workspaces">workspaces</a> ·
    <a href={`/workspaces/${data.workspaceId}`}><code>{data.workspaceId}</code></a> ·
    peers · <code>{data.peerId}</code>
  </p>

  <nav class="tabs">
    {#each tabs as tab (tab.id)}
      <a class="tab" class:active={isActive(tab.id)} href={hrefFor(tab.id)}>{tab.label}</a>
    {/each}
  </nav>

  <div class="tab-body">{@render children()}</div>
</div>

<style>
  .peer-chrome {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--color-border);
  }
  .tab {
    padding: 0.5rem 1rem;
    color: var(--color-fg-muted);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    font-size: var(--text-sm);
  }
  .tab:hover {
    color: var(--color-fg);
  }
  .tab.active {
    color: var(--color-yellow-500);
    border-bottom-color: var(--color-yellow-500);
  }
  .tab-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
