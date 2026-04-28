<script lang="ts">
import { page } from '$app/state';
import Divider from '$ui/ascii/Divider.svelte';
import ErrorMark from '$ui/ascii/ErrorMark.svelte';
import Icon from '$ui/pixel/Icon.svelte';
</script>

<div class="error-page">
  <div class="mark">
    <ErrorMark />
  </div>

  <div class="rule">
    <Divider cols={40} style="tape" />
  </div>

  <h1>
    <Icon name="alert" size={16} />
    <span>fault</span>
  </h1>

  {#if page.error}
    <p class="message">{page.error.message}</p>

    <dl class="meta">
      {#if page.error.status}
        <dt>status</dt>
        <dd><code>{page.error.status}</code></dd>
      {/if}
      {#if page.error.traceId}
        <dt>trace</dt>
        <dd>
          <code>{page.error.traceId}</code>
        </dd>
      {/if}
    </dl>
  {/if}

  <div class="rule">
    <Divider cols={40} style="tape" />
  </div>

  <p class="actions">
    <a href="/">
      <Icon name="chevron-right" size={12} />
      return to root
    </a>
  </p>
</div>

<style>
  .error-page {
    max-width: 60ch;
    margin: 4rem auto;
    padding: 0 1rem;
  }

  .mark {
    color: var(--color-yellow-500);
    font-size: var(--text-base);
    line-height: 1.0;
    margin: 0 0 1rem 0;
    /* Glow when there's room — purely decorative. */
    text-shadow: 0 0 8px color-mix(in oklch, var(--color-yellow-500) 50%, transparent);
  }

  .rule {
    color: var(--color-yellow-700);
    font-size: var(--text-xs);
    margin: 0.5rem 0;
    line-height: 1;
    overflow: hidden;
    white-space: nowrap;
  }

  h1 {
    font-size: var(--text-xl);
    font-weight: 700;
    margin: 0.5rem 0;
    color: var(--color-error);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  h1 :global(.pixel) {
    color: var(--color-error);
  }

  .message {
    color: var(--color-fg);
    margin: 0.5rem 0 1rem 0;
    line-height: var(--leading-relaxed);
  }

  .meta {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 1rem;
    row-gap: 0.25rem;
    margin: 0.5rem 0;
    font-size: var(--text-sm);
  }

  .meta dt {
    color: var(--color-fg-faint);
  }

  .meta dd {
    margin: 0;
    color: var(--color-fg-muted);
  }

  code {
    color: var(--color-yellow-500);
    background: var(--color-surface);
    padding: 0 0.25rem;
    border: 1px solid var(--color-border);
  }

  .actions {
    margin-top: 1rem;
  }

  a {
    color: var(--color-yellow-500);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
