<script lang="ts">
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { createApiClient } from '$api/client';
import { buildPeersQuery, type PeerSummary } from '$features/browser/api';
import PaneList from '$features/browser/PaneList.svelte';
import PeerCard from '$features/browser/PeerCard.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

let { data }: Props = $props();
let workspaceId = $derived(page.params.ws ?? '');

const client = createApiClient();
// initialData is a one-shot hydration value; the snapshot is intentional.
// svelte-ignore state_referenced_locally
const query = $derived.by(() =>
  createQuery({
    ...buildPeersQuery(client, workspaceId),
    initialData: data.peers,
  }),
);

function open(peer: PeerSummary) {
  goto(`/workspaces/${workspaceId}/peers/${peer.id}`);
}
</script>

<Pane scrollable>
  <PaneHeader title="peers" subtitle="workspace {workspaceId}" />
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
