<script lang="ts">
import { createApiClient } from '$api/client';
import { goto } from '$app/navigation';
import PaneList from '$features/browser/PaneList.svelte';
import PeerCard from '$features/browser/PeerCard.svelte';
import { type PeerSummary, buildPeersQuery } from '$features/browser/api';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();

const client = createApiClient();
// initialData is a one-shot hydration value; the snapshot is intentional.
// svelte-ignore state_referenced_locally
const query = createQuery({
  ...buildPeersQuery(client, data.workspaceId),
  initialData: data.peers,
});

function open(peer: PeerSummary) {
  goto(`/peers/${peer.id}`);
}
</script>

<Pane scrollable>
  <PaneHeader title="peers" subtitle="pinned workspace {data.workspaceId}" />
  <PaneList
    items={$query.data ?? []}
    loading={$query.isLoading}
    error={$query.error}
    empty={{ title: 'no peers in this workspace' }}
    onSelect={open}
  >
    {#snippet row(item: PeerSummary)}
      <PeerCard peer={item} />
    {/snippet}
  </PaneList>
</Pane>
