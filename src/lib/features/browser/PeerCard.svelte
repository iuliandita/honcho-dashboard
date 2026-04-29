<script lang="ts">
import type { PeerSummary } from './api';

interface Props {
  peer: PeerSummary;
  selected?: boolean;
}

const { peer, selected = false }: Props = $props();
const name = $derived(typeof peer.metadata?.name === 'string' ? peer.metadata.name : peer.id);
</script>

<article class="card" class:selected>
  <span class="name">{name}</span>
  <span class="id">{peer.id}</span>
</article>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .name {
    color: var(--color-fg);
    font-weight: 600;
  }
  .id {
    font-size: var(--text-xs);
    color: var(--color-fg-faint);
  }
</style>
