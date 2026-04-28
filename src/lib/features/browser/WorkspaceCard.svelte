<script lang="ts">
import type { WorkspaceSummary } from './api';

interface Props {
  workspace: WorkspaceSummary;
  selected?: boolean;
}

let { workspace, selected = false }: Props = $props();
</script>

<article class="card" class:selected>
  <span class="name">{workspace.name}</span>
  <span class="id">{workspace.id}</span>
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
