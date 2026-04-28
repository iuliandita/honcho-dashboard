import { loadSessionMessages } from '$lib/route-shared/peer-loads';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch, parent, params }) => loadSessionMessages(fetch, parent, params);
