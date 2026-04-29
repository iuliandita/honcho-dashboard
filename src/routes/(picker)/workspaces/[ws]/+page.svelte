<script lang="ts">
import { createApiClient } from '$api/client';
import { page } from '$app/state';
import PaneList from '$features/browser/PaneList.svelte';
import PeerCard from '$features/browser/PeerCard.svelte';
import { type PeerSummary, buildPeersQuery } from '$features/browser/api';
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import { getContext } from 'svelte';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();
const settings = getContext<AppSettings>('app-settings');
const workspaceId = $derived(page.params.ws ?? '');

const client = createApiClient();
// initialData is a one-shot hydration value; the snapshot is intentional.
// svelte-ignore state_referenced_locally
const query = $derived.by(() =>
  createQuery({
    ...buildPeersQuery(client, workspaceId),
    initialData: data.peers,
  }),
);
</script>

<Pane scrollable>
  <PaneHeader title={t(settings.locale, 'nav.peers')} subtitle={`${t(settings.locale, 'common.workspace')} ${workspaceId}`} />
  <PaneList
    items={$query.data ?? []}
    loading={$query.isLoading}
    error={$query.error}
    empty={{ title: t(settings.locale, 'browser.noPeers') }}
    hrefFor={(peer) => `/workspaces/${workspaceId}/peers/${peer.id}`}
  >
    {#snippet row(item: PeerSummary)}
      <PeerCard peer={item} />
    {/snippet}
  </PaneList>
</Pane>
