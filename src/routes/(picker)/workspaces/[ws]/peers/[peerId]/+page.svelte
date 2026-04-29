<script lang="ts">
import { createApiClient } from '$api/client';
import PaneList from '$features/browser/PaneList.svelte';
import SessionCard from '$features/browser/SessionCard.svelte';
import { type SessionSummary, buildSessionsQuery } from '$features/browser/api';
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import { getContext } from 'svelte';
import type { LayoutData, PageData } from './$types';

interface Props {
  data: PageData & LayoutData;
}

const { data }: Props = $props();
const settings = getContext<AppSettings>('app-settings');

const client = createApiClient();
// initialData is a one-shot hydration value; the snapshot is intentional.
// svelte-ignore state_referenced_locally
const query = createQuery({
  ...buildSessionsQuery(client, data.workspaceId, data.peerId),
  initialData: data.sessions,
});
</script>

<Pane scrollable>
  <PaneHeader title={t(settings.locale, 'nav.sessions')} subtitle={`${t(settings.locale, 'common.peer')} ${data.peerId}`} />
  <PaneList
    items={$query.data ?? []}
    loading={$query.isLoading}
    error={$query.error}
    empty={{ title: t(settings.locale, 'browser.noSessions') }}
    hrefFor={(session) => `/workspaces/${data.workspaceId}/peers/${data.peerId}/sessions/${session.id}`}
  >
    {#snippet row(item: SessionSummary)}
      <SessionCard session={item} />
    {/snippet}
  </PaneList>
</Pane>
