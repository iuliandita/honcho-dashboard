<script lang="ts">
import { emptyArchive } from '$ui/ascii';

interface Props {
  title: string;
  /** Optional secondary line. */
  description?: string;
  /** ASCII art block. Defaults to the finalized `emptyArchive` mark. */
  art?: string;
}

const { title, description, art }: Props = $props();
</script>

<div class="empty-state" role="status">
  <pre class="ascii art" aria-hidden="true">{art ?? emptyArchive}</pre>
  <p class="title">{title}</p>
  {#if description}<p class="description">{description}</p>{/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem 1rem;
    color: var(--color-fg-muted);
  }
  .art {
    color: var(--color-yellow-500);
    font-size: var(--text-xs);
    line-height: 1.05;
    margin: 0;
  }
  .title {
    margin: 0;
    color: var(--color-fg);
  }
  .description {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-fg-faint);
    text-align: center;
    max-width: 40ch;
  }
</style>
