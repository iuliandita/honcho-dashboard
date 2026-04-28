<script lang="ts">
import { createApiClient } from '$api/client';
import MessageList from '$features/messages/MessageList.svelte';
import { buildSessionMessagesQuery } from '$features/messages/api';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createInfiniteQuery } from '@tanstack/svelte-query';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();

const client = createApiClient();
// initialData is a one-shot hydration value; the snapshot is intentional.
// svelte-ignore state_referenced_locally
const query = createInfiniteQuery({
  ...buildSessionMessagesQuery(client, data.workspaceId, data.peerId, data.sessionId),
  initialData: { pages: [data.firstPage], pageParams: [1] },
});
</script>

<Pane scrollable>
  <PaneHeader title="messages" subtitle="session {data.sessionId}" />
  <MessageList {query} peerId={data.peerId} />
</Pane>
