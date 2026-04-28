<script lang="ts">
import { keys } from '$api/keys';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import { useQueryClient } from '@tanstack/svelte-query';
import { ChatStream } from './ChatStream.svelte';

interface Props {
  peerId: string;
  workspaceId: string;
}

const { peerId, workspaceId }: Props = $props();

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

async function submit() {
  const q = inputValue.trim();
  if (!q || stream.isStreaming) return;
  inputValue = '';
  await stream.send(q);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submit();
  }
}
</script>

<div class="chat-panel">
  <div class="output" role="region" aria-label="chat response" aria-live="polite">
    {#if !stream.tokens && !stream.error && !stream.isStreaming}
      <EmptyState
        title="ask honcho about this peer"
        description="this calls /peers/{peerId}/chat — natural-language queries against the peer's learned state"
      />
    {:else if stream.error}
      <article class="response error">
        <header>error · status {stream.error.status}</header>
        <pre class="content">{stream.tokens}</pre>
        <p class="error-message">{stream.error.message}</p>
        {#if stream.error.traceId}
          <p class="trace">trace: <code>{stream.error.traceId}</code></p>
        {/if}
        <button type="button" class="retry" onclick={() => stream.reset()}>clear</button>
      </article>
    {:else}
      <article class="response">
        <header>
          <span class="label">honcho</span>
          {#if stream.isStreaming}
            <span class="streaming">streaming…</span>
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
      placeholder={stream.isStreaming ? 'streaming…' : 'ask about this peer'}
      bind:value={inputValue}
      onkeydown={handleKeydown}
      disabled={stream.isStreaming}
      rows="2"
    ></textarea>
    {#if stream.isStreaming}
      <button type="button" class="cancel" onclick={() => stream.cancel()}>cancel</button>
    {:else}
      <button type="submit" class="send" disabled={!inputValue.trim()}>send</button>
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
    border-left: 3px solid var(--color-yellow-500);
    background: var(--color-surface);
  }
  .response.error {
    border-left-color: var(--color-error);
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
  .response.error header {
    color: var(--color-error);
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
  .error-message {
    margin: 0;
    color: var(--color-error);
    font-size: var(--text-sm);
  }
  .trace {
    margin: 0;
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
  }
  .trace code {
    color: var(--color-yellow-500);
  }
  .retry {
    align-self: flex-start;
    background: transparent;
    color: var(--color-fg);
    border: 1px solid var(--color-border);
    padding: 0.25rem 0.6rem;
    font-family: inherit;
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .retry:hover {
    border-color: var(--color-yellow-500);
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg);
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
    font-family: inherit;
    font-size: var(--text-sm);
    cursor: pointer;
  }
  .send:hover { background: color-mix(in oklab, var(--color-yellow-500) 12%, transparent); }
  .send:disabled { opacity: 0.4; cursor: not-allowed; }
  .cancel { color: var(--color-error); border-color: var(--color-error); }
  .cancel:hover { background: color-mix(in oklab, var(--color-error) 12%, transparent); }
</style>
