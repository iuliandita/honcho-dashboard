<script lang="ts">
import '$ui/fonts.css';
import '$ui/tokens.css';
import BrandMark from '$ui/ascii/BrandMark.svelte';
import Icon from '$ui/pixel/Icon.svelte';
import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

let theme = $state<'dark' | 'light'>(
  typeof localStorage !== 'undefined' ? ((localStorage.getItem('theme') as 'dark' | 'light' | null) ?? 'dark') : 'dark',
);

$effect(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }
});

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
}
</script>

<QueryClientProvider client={queryClient}>
  <header class="chrome">
    <h1 class="sr-only">honcho-dashboard</h1>
    <span class="brand"><BrandMark /></span>
    <span class="rule" aria-hidden="true">─ ─ ─</span>
    <span class="version">v{data.runtimeConfig.version}</span>
    {#if data.runtimeConfig.workspaceId}
      <span class="rule" aria-hidden="true">─ ─ ─</span>
      <span class="ws"><Icon name="user" size={12} /> {data.runtimeConfig.workspaceId}</span>
    {/if}
    <span class="spacer"></span>
    <button type="button" class="theme-toggle" onclick={toggleTheme} aria-label="toggle theme">
      <span class="theme-glyph" aria-hidden="true">{theme === 'dark' ? '◐' : '◑'}</span>
      <span class="theme-label">{theme === 'dark' ? 'light' : 'dark'}</span>
    </button>
  </header>

  <main class="main">
    {@render children()}
  </main>
</QueryClientProvider>

<style>
  .chrome {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    font-size: var(--text-sm);
    min-height: 32px;
  }

  .brand {
    color: var(--color-yellow-500);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1;
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

  .theme-toggle {
    background: transparent;
    color: var(--color-fg);
    border: 1px solid var(--color-border);
    padding: 0.25rem 0.6rem;
    font-family: inherit;
    font-size: var(--text-xs);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 0;
  }

  .theme-toggle:hover {
    border-color: var(--color-yellow-500);
    color: var(--color-yellow-500);
  }

  .theme-glyph {
    font-size: var(--text-base);
    line-height: 1;
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
    .rule {
      display: none;
    }
    .ws {
      display: none;
    }
  }
</style>
