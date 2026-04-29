<script lang="ts">
import { keys } from '$api/keys';
import { t } from '$lib/i18n';
import { getLocaleContext } from '$lib/settings/context';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import ErrorState from '$ui/primitives/ErrorState.svelte';
import { useQueryClient } from '@tanstack/svelte-query';
import { ChatStream } from './ChatStream.svelte';

interface Props {
  peerId: string;
  workspaceId: string;
}

const { peerId, workspaceId }: Props = $props();
const settings = getLocaleContext();

const queryClient = useQueryClient();

const stream = $derived.by(
  () =>
    new ChatStream({
      workspaceId,
      peerId,
      invalidatePeer: async (pId) => {
        await queryClient.invalidateQueries({ queryKey: keys.peer(workspaceId, pId) });
      },
    }),
);

// Cancel an in-flight stream when peer/workspace changes or on unmount.
$effect(() => {
  const current = stream;
  return () => current.cancel();
});

let inputValue = $state('');
let lastQuery = $state('');

async function submit() {
  const q = inputValue.trim();
  if (!q || stream.isStreaming) return;
  lastQuery = q;
  inputValue = '';
  await stream.send(q);
}

async function retryLastQuery() {
  if (!lastQuery || stream.isStreaming) return;
  await stream.send(lastQuery);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submit();
  }
}
</script>

<div class="chat-panel">
  <div class="output" role="region" aria-label={t(settings.locale, 'chat.response')} aria-live="polite">
    {#if !stream.tokens && !stream.error && !stream.isStreaming}
      <EmptyState
        title={t(settings.locale, 'chat.empty')}
        description={t(settings.locale, 'chat.empty.description')}
      />
    {:else if stream.error}
      <div class="error-stack">
        {#if stream.tokens}
          <pre class="content partial">{stream.tokens}</pre>
        {/if}
        <ErrorState
          error={stream.error}
          title={t(settings.locale, 'chat.failed')}
          context={`/peers/${peerId}/chat`}
          onRetry={lastQuery ? retryLastQuery : undefined}
          onClear={() => stream.reset()}
        />
      </div>
    {:else}
      <article class="response">
        <header>
          <span class="label">{t(settings.locale, 'chat.assistant')}</span>
          {#if stream.isStreaming}
            <span class="streaming">{t(settings.locale, 'chat.streaming')}</span>
          {:else if stream.expectedEnd}
            <span class="done">
              {stream.tokens.length} chars
              {#if stream.tokensPerSec > 0} · {stream.tokensPerSec} c/s{/if}
            </span>
          {/if}
        </header>
        <pre
          class="content">{stream.tokens}{#if stream.isStreaming}<span class="cursor">▍</span>{/if}</pre>
      </article>
    {/if}
  </div>

  <form
    class="input-row"
    onsubmit={(e) => {
      e.preventDefault();
      submit();
    }}
  >
    <textarea
      class="input"
      aria-label={t(settings.locale, 'chat.prompt')}
      placeholder={stream.isStreaming ? t(settings.locale, 'chat.streaming') : t(settings.locale, 'chat.prompt.short')}
      bind:value={inputValue}
      onkeydown={handleKeydown}
      disabled={stream.isStreaming}
      rows="2"
    ></textarea>
    {#if stream.isStreaming}
      <button type="button" class="cancel" onclick={() => stream.cancel()}>{t(settings.locale, 'chat.cancel')}</button>
    {:else}
      <button type="submit" class="send" disabled={!inputValue.trim()}>{t(settings.locale, 'chat.send')}</button>
    {/if}
  </form>
</div>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .output {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 1rem;
  }
  .response {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-yellow-500);
    background: color-mix(in oklab, var(--color-yellow-500) 6%, var(--color-surface));
  }
  .response header {
    display: flex;
    gap: 0.75rem;
    align-items: baseline;
    color: var(--color-yellow-500);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
  }
  .label { color: var(--color-yellow-500); }
  .streaming {
    color: var(--color-fg-muted);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
  }
  .done {
    color: var(--color-fg-faint);
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
  }
  .content {
    margin: 0;
    color: var(--color-fg);
    font-family: inherit;
    font-size: var(--text-sm);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .cursor {
    color: var(--color-yellow-500);
    animation: var(--animate-cursor-blink);
  }
  .error-stack {
    display: grid;
    gap: 0.75rem;
  }
  .partial {
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
  }
  .input {
    flex: 1;
    background: var(--color-surface);
    color: var(--color-fg);
    border: 1px solid var(--color-border);
    padding: 0.5rem 0.75rem;
    font-family: inherit;
    font-size: var(--text-sm);
    resize: vertical;
    min-height: 2.5rem;
  }
  .input:focus {
    outline: 1px solid var(--color-yellow-500);
    outline-offset: -1px;
  }
  .input:disabled {
    opacity: 0.6;
  }
  .send,
  .cancel {
    align-self: flex-start;
    background: transparent;
    color: var(--color-yellow-500);
    border: 1px solid var(--color-yellow-500);
    padding: 0.5rem 1rem;
    min-width: 44px;
    min-height: 44px;
    font-family: inherit;
    font-size: var(--text-sm);
    cursor: pointer;
  }
  .send:hover { background: color-mix(in oklab, var(--color-yellow-500) 12%, transparent); }
  .send:disabled { opacity: 0.4; cursor: not-allowed; }
  .cancel { color: var(--color-error); border-color: var(--color-error); }
  .cancel:hover { background: color-mix(in oklab, var(--color-error) 12%, transparent); }

  @media (max-width: 480px) {
    .output {
      padding: 0.75rem;
    }
    .input-row {
      padding: 0.75rem;
    }
    .input {
      min-height: 3rem;
    }
    .send,
    .cancel {
      padding-inline: 0.85rem;
    }
  }
</style>
