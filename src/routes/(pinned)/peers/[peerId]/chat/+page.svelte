<script lang="ts">
import PeerChatRoute from '$lib/route-shared/PeerChatRoute.svelte';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();
</script>

<PeerChatRoute workspaceId={data.workspaceId} peerId={data.peerId} />
