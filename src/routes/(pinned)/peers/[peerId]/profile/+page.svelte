<script lang="ts">
import PeerProfileRoute from '$lib/route-shared/PeerProfileRoute.svelte';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();
</script>

<PeerProfileRoute workspaceId={data.workspaceId} peerId={data.peerId} profile={data.profile} />
