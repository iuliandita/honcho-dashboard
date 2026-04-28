<script lang="ts">
import ChatPanel from '$features/chat/ChatPanel.svelte';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();
</script>

<div class="chat-route">
  <ChatPanel peerId={data.peerId} workspaceId={data.workspaceId} />
</div>

<style>
  .chat-route {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 12rem);
    min-height: 24rem;
  }
</style>
