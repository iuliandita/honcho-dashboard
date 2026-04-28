import { loadPeerRepresentation } from '$lib/route-shared/peer-loads';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch, parent }) => loadPeerRepresentation(fetch, parent);
