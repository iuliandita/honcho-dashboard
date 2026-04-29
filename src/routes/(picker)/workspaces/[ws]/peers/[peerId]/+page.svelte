<script lang="ts">
import PeerSessionsRoute from '$lib/route-shared/PeerSessionsRoute.svelte';
import type { LayoutData, PageData } from './$types';

interface Props {
  data: PageData & LayoutData;
}

const { data }: Props = $props();
</script>

<PeerSessionsRoute workspaceId={data.workspaceId} peerId={data.peerId} sessions={data.sessions} />
