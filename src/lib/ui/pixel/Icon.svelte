<script lang="ts">
import { type IconName, gridToPath, grids } from './grids';

interface Props {
  name: IconName;
  /** Integer multiples of 16 keep the grid pixel-aligned. */
  size?: number;
  /** Optional accessible label. If present, the SVG is `role=img`. */
  label?: string;
}

const { name, size = 16, label }: Props = $props();

const path = $derived(gridToPath(grids[name]));
const ariaHidden = $derived(label ? undefined : true);
const role = $derived(label ? 'img' : undefined);
</script>

<svg
  class="pixel"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 16 16"
  width={size}
  height={size}
  shape-rendering="crispEdges"
  aria-hidden={ariaHidden}
  {role}
  aria-label={label}
>
  <path d={path} fill="currentColor" />
</svg>

<style>
  svg {
    display: inline-block;
    vertical-align: middle;
    image-rendering: pixelated;
  }
</style>
