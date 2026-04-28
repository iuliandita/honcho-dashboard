<script lang="ts">
import ChatPanel from '$features/chat/ChatPanel.svelte';

interface Props {
  workspaceId: string;
  peerId: string;
}

const { workspaceId, peerId }: Props = $props();
</script>

<div class="chat-route">
  <ChatPanel {peerId} {workspaceId} />
</div>

<style>
  .chat-route {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 12rem);
    min-height: 24rem;
  }
</style>
