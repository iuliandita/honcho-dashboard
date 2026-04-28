<script lang="ts">
import PeerRepresentationRoute from '$lib/route-shared/PeerRepresentationRoute.svelte';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();
</script>

<PeerRepresentationRoute
  workspaceId={data.workspaceId}
  peerId={data.peerId}
  representation={data.representation}
/>
