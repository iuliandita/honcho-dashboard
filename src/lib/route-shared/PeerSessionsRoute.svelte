<script lang="ts">
import { createApiClient } from '$api/client';
import PaneList from '$features/browser/PaneList.svelte';
import SessionCard from '$features/browser/SessionCard.svelte';
import { type SessionSummary, buildSessionsQuery } from '$features/browser/api';
import { t } from '$lib/i18n';
import { sessionPath } from '$lib/routing/paths';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import { getContext } from 'svelte';

interface Props {
  workspaceId: string;
  peerId: string;
  sessions: SessionSummary[];
  pinned?: boolean;
}

const { workspaceId, peerId, sessions, pinned = false }: Props = $props();
const settings = getContext<AppSettings>('app-settings');

const client = createApiClient();
// initialData is a one-shot hydration value; the snapshot is intentional.
// svelte-ignore state_referenced_locally
const query = $derived.by(() =>
  createQuery({
    ...buildSessionsQuery(client, workspaceId, peerId),
    initialData: sessions,
  }),
);
</script>

<Pane scrollable>
  <PaneHeader title={t(settings.locale, 'nav.sessions')} subtitle={`${t(settings.locale, 'common.peer')} ${peerId}`} />
  <PaneList
    items={$query.data ?? []}
    loading={$query.isLoading}
    error={$query.error}
    empty={{ title: t(settings.locale, 'browser.noSessions') }}
    hrefFor={(session) => sessionPath(peerId, session.id, pinned ? undefined : workspaceId)}
  >
    {#snippet row(item: SessionSummary)}
      <SessionCard session={item} />
    {/snippet}
  </PaneList>
</Pane>
