import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { workspaceId, peerId } = await parent();
  return { workspaceId, peerId };
};
