<script lang="ts">
import { type IconName, gridToPath, grids } from './grids';

interface Props {
  name: IconName;
  /**
   * Rendered pixel size. Defaults to 16 (1 SVG pixel = 1 CSS pixel — a true
   * 1× pixel icon). Stick to integer multiples (16, 32, 48) so the grid
   * stays pixel-aligned. Other sizes still render via crisp-edges, but
   * non-integer scales technically lose the integer-snap promise.
   */
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
    /* No anti-aliasing, ever. */
  }
</style>
