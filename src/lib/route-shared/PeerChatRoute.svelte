<script lang="ts">
import ChatPanel from '$features/chat/ChatPanel.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';

interface Props {
  workspaceId: string;
  peerId: string;
}

const { workspaceId, peerId }: Props = $props();
</script>

<Pane>
  <PaneHeader title="chat" subtitle="peer {peerId}" />
  <div class="chat-route pane-body">
  <ChatPanel {peerId} {workspaceId} />
  </div>
</Pane>

<style>
  .chat-route {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
</style>
