<script lang="ts">
import PeerListRoute from '$lib/route-shared/PeerListRoute.svelte';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();
</script>

<PeerListRoute workspaceId={data.workspaceId} peers={data.peers} />
