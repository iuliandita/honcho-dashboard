<script lang="ts">
import { page } from '$app/state';

// ASCII fallback art — placeholder; finalized in frontend-design phase.
const errorMark = `   _____ ____  ____    ___  ____
  | ___|  _ \\|  _ \\  / _ \\|  _ \\
  |  _| | |_) | |_) || | | | |_) |
  |___| |  _ <|  _ < | |_| |  _ <
        |_| \\_\\_| \\_\\ \\___/|_| \\_\\`;
</script>

<div class="error-page">
  <pre class="art" aria-hidden="true">{errorMark}</pre>
  <h1>Something broke.</h1>
  {#if page.error}
    <p class="message">{page.error.message}</p>
    {#if page.error.status}
      <p class="status">status: <code>{page.error.status}</code></p>
    {/if}
    {#if page.error.traceId}
      <p class="trace">trace: <code>{page.error.traceId}</code></p>
    {/if}
  {/if}
  <p class="actions">
    <a href="/">return to root</a>
  </p>
</div>

<style>
  .error-page {
    max-width: 60ch;
    margin: 4rem auto;
    padding: 0 1rem;
  }
  .art {
    color: var(--color-yellow-500);
    font-size: var(--text-xs);
    line-height: 1.2;
    margin-bottom: 2rem;
  }
  h1 {
    font-size: var(--text-xl);
    margin: 0 0 0.5rem 0;
  }
  .message {
    color: var(--color-fg);
    margin: 0.5rem 0;
  }
  .status, .trace {
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
    margin: 0.25rem 0;
  }
  code {
    color: var(--color-yellow-500);
  }
  .actions {
    margin-top: 2rem;
  }
  a {
    color: var(--color-yellow-500);
  }
</style>
