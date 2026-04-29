<script lang="ts">
import { page } from '$app/state';
import Icon from '$ui/pixel/Icon.svelte';
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import { getContext, type Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();
const settings = getContext<AppSettings>('app-settings');

const isSearch = $derived(page.url.pathname.startsWith('/search'));
</script>

<section class="pinned-mode">
  <nav class="ws-nav" aria-label={t(settings.locale, 'common.pinnedWorkspace')}>
    <p class="banner">
      <Icon name="dot" size={10} />
      <span class="label">{t(settings.locale, 'mode.pinned')}</span>
      <span class="sep" aria-hidden="true">·</span>
      <span class="ws-id">{t(settings.locale, 'common.workspace')} <code>{data.workspaceId}</code></span>
    </p>
    <a class="search-link" class:active={isSearch} href="/search" aria-current={isSearch ? 'page' : undefined}>
      <Icon name="search" size={12} />
      <span>{t(settings.locale, 'nav.search')}</span>
    </a>
  </nav>
  {@render children()}
</section>

<style>
  .pinned-mode {
    display: contents;
  }

  .ws-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: 0 0 1rem 0;
  }

  .banner {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
    margin: 0;
  }

  .banner :global(.pixel) {
    color: var(--color-ok);
  }

  .label {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-fg-faint);
  }

  .sep {
    color: var(--color-border);
  }

  code {
    color: var(--color-yellow-500);
    background: var(--color-surface);
    padding: 0 0.25rem;
    border: 1px solid var(--color-border);
    font-size: var(--text-xs);
  }

  .search-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-width: 44px;
    min-height: 44px;
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
