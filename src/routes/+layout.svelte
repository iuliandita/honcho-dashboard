<script lang="ts">
import '$ui/fonts.css';
import '$ui/tokens.css';
import AuthGate from '$lib/auth/AuthGate.svelte';
import { AppSettings } from '$lib/settings/AppSettings.svelte';
import BrandMark from '$ui/ascii/BrandMark.svelte';
import Icon from '$ui/pixel/Icon.svelte';
import SettingsMenu from '$ui/primitives/SettingsMenu.svelte';
import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
import { setContext } from 'svelte';
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children: pageContent }: Props = $props();
const settings = new AppSettings();
setContext('app-settings', settings);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

$effect(() => settings.apply());
</script>

<QueryClientProvider client={queryClient}>
  <AuthGate {settings}>
    {#snippet children(auth)}
      <header class="chrome">
        <div class="chrome-inner">
          <h1 class="sr-only">honcho-dashboard</h1>
          <a class="brand" href="/" aria-label="honcho-dashboard"><BrandMark /></a>
          <span class="rule" aria-hidden="true">─ ─ ─</span>
          <span class="version">v{data.runtimeConfig.version}</span>
          {#if data.runtimeConfig.workspaceId}
            <span class="rule" aria-hidden="true">─ ─ ─</span>
            <span class="ws"><Icon name="user" size={12} /> {data.runtimeConfig.workspaceId}</span>
          {/if}
          <span class="spacer"></span>
          <SettingsMenu {settings} authEnabled={auth.enabled} onLogout={auth.logout} />
        </div>
      </header>

      <main class="main">
        {@render pageContent()}
      </main>
    {/snippet}
  </AuthGate>
</QueryClientProvider>

<style>
  .chrome {
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .chrome-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-sizing: border-box;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0.5rem 1rem;
    font-size: var(--text-sm);
    min-height: 32px;
  }

  .brand {
    color: var(--color-yellow-500);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1;
    text-decoration: none;
  }

  .brand:hover {
    color: var(--color-yellow-400);
  }

  .rule {
    color: var(--color-border);
    font-size: var(--text-xs);
  }

  .version {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
  }

  .ws {
    color: var(--color-fg-muted);
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .ws :global(.pixel) {
    color: var(--color-yellow-500);
  }

  .spacer {
    flex: 1;
  }

  .main {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    width: 100%;
    padding: 1rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 640px) {
    .chrome {
      padding: 0;
    }
    .chrome-inner {
      gap: 0.5rem;
      padding: 0.35rem 0.875rem;
    }
    .rule {
      display: none;
    }
    .ws {
      display: none;
    }
    .main {
      padding: 0.75rem 0.875rem;
    }
  }
</style>
