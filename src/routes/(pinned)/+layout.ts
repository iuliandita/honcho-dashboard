import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  const { runtimeConfig } = await parent();
  if (runtimeConfig.workspaceId === null) {
    // Operator deployed without HONCHO_WORKSPACE_ID, but the URL is in pinned-mode tree.
    // Likely a stale bookmark from a previous pinned deployment. Redirect, don't error.
    redirect(307, '/workspaces');
  }
  return { workspaceId: runtimeConfig.workspaceId };
};
