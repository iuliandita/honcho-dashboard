<script lang="ts">
import { createApiClient } from '$api/client';
import ProfileMarkdown from '$features/profile/ProfileMarkdown.svelte';
import { buildPeerProfileQuery } from '$features/profile/api';
import EmptyState from '$ui/primitives/EmptyState.svelte';
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
  ...buildPeerProfileQuery(client, data.workspaceId, data.peerId),
  initialData: data.profile,
});
</script>

<Pane scrollable>
  <PaneHeader title="profile" subtitle="peer {data.peerId}" />
  {#if $query.isLoading && !$query.data}
    <p class="state">loading profile...</p>
  {:else if $query.isError}
    <p class="state error">error: {$query.error?.message}</p>
  {:else if $query.data}
    <ProfileMarkdown profile={$query.data} />
  {:else}
    <EmptyState title="no profile" />
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
