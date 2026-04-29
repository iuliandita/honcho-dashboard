<script lang="ts">
import SessionMessagesRoute from '$lib/route-shared/SessionMessagesRoute.svelte';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();
</script>

<SessionMessagesRoute
  workspaceId={data.workspaceId}
  peerId={data.peerId}
  sessionId={data.sessionId}
  firstPage={data.firstPage}
/>
