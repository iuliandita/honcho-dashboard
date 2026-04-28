<script lang="ts">
import { goto } from '$app/navigation';
import { createApiClient } from '$api/client';
import { buildWorkspacesQuery, type WorkspaceSummary } from '$features/browser/api';
import PaneList from '$features/browser/PaneList.svelte';
import WorkspaceCard from '$features/browser/WorkspaceCard.svelte';
import Pane from '$ui/primitives/Pane.svelte';
import PaneHeader from '$ui/primitives/PaneHeader.svelte';
import { createQuery } from '@tanstack/svelte-query';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

let { data }: Props = $props();

const client = createApiClient();
// initialData is a one-shot hydration value; capturing data.workspaces here is the intended seed.
// svelte-ignore state_referenced_locally
const query = createQuery({
  ...buildWorkspacesQuery(client),
  initialData: data.workspaces,
});

function open(workspace: WorkspaceSummary) {
  goto(`/workspaces/${workspace.id}`);
}
</script>

<Pane scrollable>
  <PaneHeader title="workspaces" subtitle="select a workspace to inspect" />
  <PaneList
    items={$query.data ?? []}
    loading={$query.isLoading}
    error={$query.error}
    empty={{ title: 'no workspaces', description: 'this admin token has no visible workspaces' }}
    onSelect={open}
  >
    {#snippet row(item: WorkspaceSummary)}
      <WorkspaceCard workspace={item} />
    {/snippet}
  </PaneList>
</Pane>
