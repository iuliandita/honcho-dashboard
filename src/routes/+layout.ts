import { fetchRuntimeConfig } from '$lib/runtime-config';
import type { LayoutLoad } from './$types';

export const ssr = false; // adapter-static + SPA-only client rendering
export const prerender = false; // dynamic runtime config; nothing to prerender
export const trailingSlash = 'never';

export const load: LayoutLoad = async ({ fetch }) => {
  const runtimeConfig = await fetchRuntimeConfig({ fetch });
  return { runtimeConfig };
};
