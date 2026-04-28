import type { PageLoad } from './$types';

// No data to fetch; the showcase reads computed style at component mount.
export const load: PageLoad = async () => {
  return {};
};
