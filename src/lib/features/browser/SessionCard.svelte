<script lang="ts">
import type { SessionSummary } from './api';

interface Props {
  session: SessionSummary;
  selected?: boolean;
}

const { session, selected = false }: Props = $props();

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}
</script>

<article class="card" class:selected>
  <span class="id">{session.id}</span>
  <span class="meta">
    {formatTimestamp(session.updatedAt)}
    {#if session.messageCount !== undefined}
      · {session.messageCount} msg
    {/if}
  </span>
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .id {
    color: var(--color-fg);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .meta {
    font-size: var(--text-xs);
    color: var(--color-fg-faint);
    font-variant-numeric: tabular-nums;
  }
</style>
