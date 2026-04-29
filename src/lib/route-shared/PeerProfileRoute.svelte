<script lang="ts">
import { createApiClient } from '$api/client';
import ProfileMarkdown from '$features/profile/ProfileMarkdown.svelte';
import { type ProfileResponse, buildPeerProfileQuery } from '$features/profile/api';
import EmptyProfile from '$ui/ascii/EmptyProfile.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import ErrorState from '$ui/primitives/ErrorState.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';

interface Props {
  workspaceId: string;
  peerId: string;
  profile: ProfileResponse;
}

const { workspaceId, peerId, profile }: Props = $props();

const client = createApiClient();
// svelte-ignore state_referenced_locally
const query = createQuery({
  ...buildPeerProfileQuery(client, workspaceId, peerId),
  initialData: profile,
});
</script>

<Pane scrollable>
  <PaneHeader title="profile" subtitle="peer {peerId}" />
  <div class="pane-body">
    {#if $query.isLoading && !$query.data}
      <p class="state">loading profile...</p>
    {:else if $query.isError}
      <div class="state-block">
        <ErrorState error={$query.error} title="profile failed" context={`peer ${peerId}`} onRetry={() => $query.refetch()} />
      </div>
    {:else if $query.data}
      <ProfileMarkdown profile={$query.data} />
    {:else}
      <EmptyState title="no profile">
        {#snippet art()}<EmptyProfile />{/snippet}
      </EmptyState>
    {/if}
  </div>
</Pane>

<style>
  .state {
    padding: 1rem;
    color: var(--color-fg-muted);
  }
  .state-block {
    padding: 1rem;
  }
</style>
