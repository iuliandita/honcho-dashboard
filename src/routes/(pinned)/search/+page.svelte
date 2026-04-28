<script lang="ts">
import WorkspaceSearchRoute from '$lib/route-shared/WorkspaceSearchRoute.svelte';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();
</script>

<WorkspaceSearchRoute
  workspaceId={data.workspaceId}
  initialQuery={data.initialQuery}
  initialTopic={data.initialTopic}
  initialResponse={data.initialResponse}
  peerHrefPrefix="/peers"
/>
