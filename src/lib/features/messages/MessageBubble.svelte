<script lang="ts">
import type { Message } from './api';
import { formatAbsolute, normalizeRole } from './format';

interface Props {
  message: Message;
  peerId: string;
}

const { message, peerId }: Props = $props();
const role = $derived(normalizeRole(message.peer_id === peerId ? 'user' : 'assistant'));
</script>

<article class="bubble" data-role={role}>
  <header class="meta">
    <span class="role">{role}</span>
    <span class="ts" title={message.created_at}>{formatAbsolute(message.created_at)}</span>
  </header>
  <pre class="content">{message.content}</pre>
</article>

<style>
  .bubble {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    border-left: 3px solid transparent;
  }
  .bubble[data-role='user'] {
    border-left-color: var(--color-yellow-500);
  }
  .bubble[data-role='assistant'] {
    border-left-color: var(--color-fg-muted);
  }
  .bubble[data-role='system'] {
    border-left-color: var(--color-warn);
  }
  .bubble[data-role='other'] {
    border-left-color: var(--color-fg-faint);
  }
  .meta {
    display: flex;
    gap: 0.75rem;
    align-items: baseline;
  }
  .role {
    color: var(--color-yellow-500);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
  }
  .ts {
    color: var(--color-fg-faint);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }
  .content {
    margin: 0;
    color: var(--color-fg);
    white-space: pre-wrap;
    word-break: break-word;
    font-family: inherit;
    font-size: var(--text-sm);
    line-height: 1.5;
  }
</style>
