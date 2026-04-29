<script lang="ts">
import { page } from '$app/state';
import { type MessageKey, t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import { type Snippet, getContext } from 'svelte';

interface Props {
  workspaceId?: string;
  peerId: string;
  children: Snippet;
}

const { workspaceId, peerId, children }: Props = $props();
const settings = getContext<AppSettings>('app-settings');

const basePath = $derived(workspaceId ? `/workspaces/${workspaceId}/peers/${peerId}` : `/peers/${peerId}`);
const tabs = [
  { id: 'sessions', labelKey: 'nav.sessions' },
  { id: 'representation', labelKey: 'nav.representation' },
  { id: 'profile', labelKey: 'nav.profile' },
  { id: 'chat', labelKey: 'nav.chat' },
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
    {#if workspaceId}
      <a href="/workspaces">{t(settings.locale, 'nav.workspaces')}</a> ·
      <a href={`/workspaces/${workspaceId}`}><code>{workspaceId}</code></a> · {t(settings.locale, 'nav.peers')} · <code>{peerId}</code>
    {:else}
      <a href="/peers">{t(settings.locale, 'nav.peers')}</a> · <code>{peerId}</code>
    {/if}
  </p>

  <nav class="tabs">
    {#each tabs as tab (tab.id)}
      <a class="tab" class:active={isActive(tab.id)} href={hrefFor(tab.id)} aria-current={isActive(tab.id) ? 'page' : undefined}
        >{t(settings.locale, tab.labelKey as MessageKey)}</a
      >
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
    overflow-wrap: anywhere;
  }
  .trail a {
    color: var(--color-yellow-500);
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
  .trail a:hover {
    color: var(--color-yellow-400);
  }
  .trail code {
    color: var(--color-fg);
  }
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--color-border);
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .tab {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    min-width: 44px;
    min-height: 44px;
    box-sizing: border-box;
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

  @media (max-width: 640px) {
    .peer-chrome {
      gap: 0.5rem;
    }
    .tabs {
      margin-inline: -0.875rem;
      padding-inline: 0.875rem;
    }
    .tab {
      flex: 0 0 auto;
      padding: 0.5rem 0.85rem;
    }
  }
</style>
