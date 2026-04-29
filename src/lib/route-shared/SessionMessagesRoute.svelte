<script lang="ts">
import { createApiClient } from '$api/client';
import MessageList from '$features/messages/MessageList.svelte';
import { type MessagesPage, buildSessionMessagesQuery } from '$features/messages/api';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createInfiniteQuery } from '@tanstack/svelte-query';

interface Props {
  workspaceId: string;
  peerId: string;
  sessionId: string;
  firstPage: MessagesPage;
}

const { workspaceId, peerId, sessionId, firstPage }: Props = $props();

const client = createApiClient();
// svelte-ignore state_referenced_locally
const query = createInfiniteQuery({
  ...buildSessionMessagesQuery(client, workspaceId, peerId, sessionId),
  initialData: { pages: [firstPage], pageParams: [1] },
});
</script>

<Pane scrollable>
  <PaneHeader title="messages" subtitle="session {sessionId}" />
  <MessageList {query} {peerId} />
</Pane>
