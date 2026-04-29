<script lang="ts">
import { t } from '$lib/i18n';
import { getLocaleContext } from '$lib/settings/context';

interface DisplayError {
  message: string;
  status?: number;
  traceId?: string;
  upstream?: string;
  detail?: string;
}

interface Props {
  error: DisplayError;
  title?: string;
  context?: string;
  onRetry?: () => void;
  onClear?: () => void;
  retryLabel?: string;
  clearLabel?: string;
}

const { error, title, context, onRetry, onClear, retryLabel, clearLabel }: Props = $props();

const settings = getLocaleContext();
const hasMeta = $derived(Boolean(error.status || error.traceId || error.upstream));
const displayTitle = $derived(title ?? t(settings.locale, 'error.requestFailed'));
const displayRetryLabel = $derived(retryLabel ?? t(settings.locale, 'error.retry'));
const displayClearLabel = $derived(clearLabel ?? t(settings.locale, 'error.clear'));
</script>

<section class="error-state" role="alert" aria-live="assertive">
  <div class="copy">
    <p class="label">{displayTitle}</p>
    <p class="message">{error.message}</p>
    {#if error.detail && error.detail !== error.message}
      <p class="detail">{error.detail}</p>
    {/if}
  </div>

  {#if hasMeta || context}
    <dl class="meta">
      {#if context}
        <dt>{t(settings.locale, 'error.context')}</dt>
        <dd>{context}</dd>
      {/if}
      {#if error.status !== undefined}
        <dt>{t(settings.locale, 'error.status')}</dt>
        <dd><code>{error.status}</code></dd>
      {/if}
      {#if error.upstream}
        <dt>{t(settings.locale, 'error.upstream')}</dt>
        <dd><code>{error.upstream}</code></dd>
      {/if}
      {#if error.traceId}
        <dt>{t(settings.locale, 'error.traceId')}</dt>
        <dd><code>{error.traceId}</code></dd>
      {/if}
    </dl>
  {/if}

  {#if onRetry || onClear}
    <div class="actions">
      {#if onRetry}
        <button type="button" class="action primary" onclick={onRetry}>{displayRetryLabel}</button>
      {/if}
      {#if onClear}
        <button type="button" class="action" onclick={onClear}>{displayClearLabel}</button>
      {/if}
    </div>
  {/if}
</section>

<style>
  .error-state {
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--color-error);
    background: color-mix(in oklab, var(--color-error) 6%, var(--color-bg));
    color: var(--color-fg);
  }

  .copy {
    display: grid;
    gap: 0.25rem;
  }

  .label {
    margin: 0;
    color: var(--color-error);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .message,
  .detail {
    margin: 0;
    font-size: var(--text-sm);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .detail {
    color: var(--color-fg-muted);
  }

  .meta {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 0.25rem 0.75rem;
    margin: 0;
    font-size: var(--text-xs);
  }

  .meta dt {
    color: var(--color-fg-faint);
  }

  .meta dd {
    margin: 0;
    min-width: 0;
    color: var(--color-fg-muted);
    overflow-wrap: anywhere;
  }

  code {
    color: var(--color-yellow-500);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 0 0.25rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .action {
    min-width: 44px;
    min-height: 44px;
    padding: 0.5rem 0.85rem;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-fg);
    font: inherit;
    font-size: var(--text-sm);
    cursor: pointer;
  }

  .action:hover {
    border-color: var(--color-yellow-500);
    color: var(--color-yellow-500);
  }

  .action.primary {
    border-color: var(--color-error);
    color: var(--color-error);
  }

  .action.primary:hover {
    background: color-mix(in oklab, var(--color-error) 12%, transparent);
  }
</style>
