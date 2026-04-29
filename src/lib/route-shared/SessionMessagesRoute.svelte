<script lang="ts">
import { createApiClient } from '$api/client';
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import MessageList from '$features/messages/MessageList.svelte';
import { type MessagesPage, buildSessionMessagesQuery } from '$features/messages/api';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createInfiniteQuery } from '@tanstack/svelte-query';
import { getContext } from 'svelte';

interface Props {
  workspaceId: string;
  peerId: string;
  sessionId: string;
  firstPage: MessagesPage;
}

const { workspaceId, peerId, sessionId, firstPage }: Props = $props();
const settings = getContext<AppSettings>('app-settings');

const client = createApiClient();
// svelte-ignore state_referenced_locally
const query = createInfiniteQuery({
  ...buildSessionMessagesQuery(client, workspaceId, peerId, sessionId),
  initialData: { pages: [firstPage], pageParams: [1] },
});
</script>

<Pane scrollable>
  <PaneHeader title={t(settings.locale, 'messages.title')} subtitle={`${t(settings.locale, 'common.session')} ${sessionId}`} />
  <MessageList {query} {peerId} />
</Pane>
