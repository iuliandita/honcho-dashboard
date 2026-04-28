<script lang="ts">
import { goto } from '$app/navigation';
import { createApiClient } from '$api/client';
import { buildSessionsQuery, type SessionSummary } from '$features/browser/api';
import PaneList from '$features/browser/PaneList.svelte';
import SessionCard from '$features/browser/SessionCard.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import type { LayoutData, PageData } from './$types';

interface Props {
  data: PageData & LayoutData;
}

let { data }: Props = $props();

const client = createApiClient();
// initialData is a one-shot hydration value; the snapshot is intentional.
// svelte-ignore state_referenced_locally
const query = createQuery({
  ...buildSessionsQuery(client, data.workspaceId, data.peerId),
  initialData: data.sessions,
});

function open(session: SessionSummary) {
  goto(`/peers/${data.peerId}/sessions/${session.id}`);
}
</script>

<Pane scrollable>
  <PaneHeader title="sessions" subtitle="peer {data.peerId}" />
  <PaneList
    items={$query.data ?? []}
    loading={$query.isLoading}
    error={$query.error}
    empty={{ title: 'no sessions for this peer' }}
    onSelect={open}
  >
    {#snippet row(item: SessionSummary)}
      <SessionCard session={item} />
    {/snippet}
  </PaneList>
</Pane>
