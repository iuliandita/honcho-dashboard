import { loadWorkspacePeers } from '$lib/route-shared/peer-loads';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  return loadWorkspacePeers(fetch, params.ws);
};
