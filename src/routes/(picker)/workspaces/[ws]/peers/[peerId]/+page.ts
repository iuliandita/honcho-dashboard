import { loadPeerSessions } from '$lib/route-shared/peer-loads';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  return loadPeerSessions(fetch, parent);
};
