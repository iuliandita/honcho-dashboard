<script lang="ts">
import { createApiClient } from '$api/client';
import RepresentationGrid from '$features/representation/RepresentationGrid.svelte';
import { type RepresentationResponse, buildPeerRepresentationQuery } from '$features/representation/api';
import EmptyMemory from '$ui/ascii/EmptyMemory.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';

interface Props {
  workspaceId: string;
  peerId: string;
  representation: RepresentationResponse;
}

const { workspaceId, peerId, representation }: Props = $props();

const client = createApiClient();
// svelte-ignore state_referenced_locally
const query = createQuery({
  ...buildPeerRepresentationQuery(client, workspaceId, peerId),
  initialData: representation,
});
</script>

<Pane scrollable>
  <PaneHeader title="representation" subtitle="peer {peerId}" />
  {#if $query.isLoading && !$query.data}
    <p class="state">loading representation...</p>
  {:else if $query.isError}
    <p class="state error">error: {$query.error?.message}</p>
  {:else if $query.data}
    <RepresentationGrid data={$query.data} />
  {:else}
    <EmptyState title="no representation">
      {#snippet art()}<EmptyMemory />{/snippet}
    </EmptyState>
  {/if}
</Pane>

<style>
  .state {
    padding: 1rem;
    color: var(--color-fg-muted);
  }
  .state.error {
    color: var(--color-error);
  }
</style>
