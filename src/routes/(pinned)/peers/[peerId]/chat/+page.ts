import { loadPeerChat } from '$lib/route-shared/peer-loads';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ parent }) => loadPeerChat(parent);
