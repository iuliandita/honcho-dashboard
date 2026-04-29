<script lang="ts">
import { createApiClient } from '$api/client';
import PaneList from '$features/browser/PaneList.svelte';
import WorkspaceCard from '$features/browser/WorkspaceCard.svelte';
import { type WorkspaceSummary, buildWorkspacesQuery } from '$features/browser/api';
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

const client = createApiClient();
// initialData is a one-shot hydration value; capturing data.workspaces here is the intended seed.
// svelte-ignore state_referenced_locally
const query = createQuery({
  ...buildWorkspacesQuery(client),
  initialData: data.workspaces,
});
</script>

<Pane scrollable>
  <PaneHeader title={t(settings.locale, 'nav.workspaces')} subtitle={t(settings.locale, 'browser.selectWorkspace')} />
  <PaneList
    items={$query.data ?? []}
    loading={$query.isLoading}
    error={$query.error}
    empty={{
      title: t(settings.locale, 'browser.noWorkspaces'),
      description: t(settings.locale, 'browser.noWorkspaces.description'),
    }}
    hrefFor={(workspace) => `/workspaces/${workspace.id}`}
  >
    {#snippet row(item: WorkspaceSummary)}
      <WorkspaceCard workspace={item} />
    {/snippet}
  </PaneList>
</Pane>
