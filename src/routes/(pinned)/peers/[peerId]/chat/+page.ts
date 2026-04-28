import type { PageLoad } from './$types';

// Chat has no initial data to fetch — the panel starts empty until the user sends.
export const load: PageLoad = async ({ parent }) => {
  const { workspaceId, peerId } = await parent();
  return { workspaceId, peerId };
};
