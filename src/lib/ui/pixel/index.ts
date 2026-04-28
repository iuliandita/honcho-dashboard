/**
 * Pixel-icon barrel.
 *
 *   import Icon from '$ui/pixel/Icon.svelte';
 *   import { iconNames, type IconName } from '$ui/pixel';
 *
 *   <Icon name="search" size={16} />
 */

export { gridToPath, grids, type IconName, type PixelGrid } from './grids';

export const iconNames = [
  'chevron-right',
  'dot',
  'search',
  'topic',
  'clock',
  'user',
  'chat-bubble',
  'refresh',
  'alert',
  'check',
  'external-link',
  'copy',
] as const;
