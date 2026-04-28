<script lang="ts">
import '$ui/tokens.css';
import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();

// Single QueryClient for the lifetime of the SPA. Stale time is set per-query.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Dark default; toggle persists across reload via localStorage.
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
    <span class="brand">honcho-dashboard</span>
    <span class="muted">v{data.runtimeConfig.version}</span>
    {#if data.runtimeConfig.workspaceId}
      <span class="pinned">workspace: {data.runtimeConfig.workspaceId}</span>
    {/if}
    <span class="spacer"></span>
    <button type="button" class="theme-toggle" onclick={toggleTheme} aria-label="toggle theme">
      {theme === 'dark' ? '◐ light' : '◑ dark'}
    </button>
  </header>

  <main class="main">
    {@render children()}
  </main>
</QueryClientProvider>

<style>
  .chrome {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }
  .brand {
    color: var(--color-yellow-500);
    font-weight: 700;
  }
  .muted {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
  }
  .pinned {
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
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
  }
  .theme-toggle:hover {
    border-color: var(--color-yellow-500);
  }
  .main {
    padding: 1rem;
  }
</style>
