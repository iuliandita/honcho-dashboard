<script lang="ts">
import { formatRelative } from '$features/messages/format';
import Icon from '$ui/pixel/Icon.svelte';
import type { SearchResult } from './api';

interface Props {
  result: SearchResult;
  href: string;
}

const { result, href }: Props = $props();
</script>

<article class="card">
  <header>
    <a class="peer" {href}>
      <Icon name="user" size={12} />
      <span>{result.peerName}</span>
    </a>
    <span class="topic">{result.topic}</span>
    <span class="score">{(result.score * 100).toFixed(0)}%</span>
  </header>
  <p class="excerpt">{result.excerpt}</p>
  <footer>
    <span class="ts">{formatRelative(result.updatedAt)}</span>
  </footer>
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .peer {
    color: var(--color-yellow-500);
    text-decoration: none;
    font-weight: 700;
    font-size: var(--text-sm);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 1.75rem;
  }

  .peer:hover {
    text-decoration: underline;
  }

  .peer:focus-visible {
    outline: 2px solid var(--color-yellow-500);
    outline-offset: 2px;
  }

  .topic {
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .score {
    margin-left: auto;
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }

  .excerpt {
    margin: 0;
    color: var(--color-fg);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  footer {
    display: flex;
    justify-content: flex-end;
  }

  .ts {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }
</style>
