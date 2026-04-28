import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  const { runtimeConfig } = await parent();
  if (runtimeConfig.workspaceId !== null) {
    // Operator deployed with HONCHO_WORKSPACE_ID set, but the URL is in picker-mode tree.
    // Stale bookmark; redirect to the pinned tree.
    redirect(307, '/peers');
  }
  return {};
};
