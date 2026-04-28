<script lang="ts">
import { divider, emptyArchive, peersMark } from '$ui/ascii';
</script>

<section class="page">
  <pre class="ascii mark" aria-hidden="true">{peersMark}</pre>
  <p class="rule" aria-hidden="true">{divider(60, 'dashed')}</p>

  <div class="empty">
    <pre class="ascii art" aria-hidden="true">{emptyArchive}</pre>
    <p>placeholder · the peer list lands in Plan 2 (browser feature).</p>
  </div>
</section>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .mark {
    color: var(--color-yellow-500);
    font-size: var(--text-base);
    line-height: 1.0;
    margin: 0;
  }

  .rule {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
    margin: 0;
    line-height: 1;
    overflow: hidden;
    white-space: nowrap;
  }

  .empty {
    margin-top: 2rem;
    padding: 1.5rem;
    border: 1px dashed var(--color-border);
    background: var(--color-surface);
    text-align: center;
  }

  .art {
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
    line-height: 1.05;
    margin: 0 auto 1rem;
    display: inline-block;
    text-align: left;
  }

  p {
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
    margin: 0;
  }
</style>
