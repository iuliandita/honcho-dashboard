<script lang="ts">
import { createApiClient } from '$api/client';
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import ProfileMarkdown from '$features/profile/ProfileMarkdown.svelte';
import { type ProfileResponse, buildPeerProfileQuery } from '$features/profile/api';
import EmptyProfile from '$ui/ascii/EmptyProfile.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import ErrorState from '$ui/primitives/ErrorState.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import { getContext } from 'svelte';

interface Props {
  workspaceId: string;
  peerId: string;
  profile: ProfileResponse;
}

const { workspaceId, peerId, profile }: Props = $props();
const settings = getContext<AppSettings>('app-settings');

const client = createApiClient();
// svelte-ignore state_referenced_locally
const query = createQuery({
  ...buildPeerProfileQuery(client, workspaceId, peerId),
  initialData: profile,
});
</script>

<Pane scrollable>
  <PaneHeader title={t(settings.locale, 'profile.title')} subtitle={`${t(settings.locale, 'common.peer')} ${peerId}`} />
  <div class="pane-body">
    {#if $query.isLoading && !$query.data}
      <p class="state">{t(settings.locale, 'profile.loading')}</p>
    {:else if $query.isError}
      <div class="state-block">
        <ErrorState
          error={$query.error}
          title={t(settings.locale, 'profile.failed')}
          context={`${t(settings.locale, 'common.peer')} ${peerId}`}
          onRetry={() => $query.refetch()}
        />
      </div>
    {:else if $query.data}
      <ProfileMarkdown profile={$query.data} />
    {:else}
      <EmptyState title={t(settings.locale, 'profile.empty')}>
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
