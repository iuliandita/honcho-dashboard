/**
 * Horizontal divider patterns. Every consumer renders these inside `<pre class="ascii">`
 * or via the `<Divider>` component (which handles repeating the pattern to the available
 * column width). Patterns are tiles, not full-width strings — repeat them.
 */

/** Solid double-rule. Strongest visual divider. */
export const tileSolid = '═';

/** Single-line. Subtle subdivision. */
export const tileLine = '─';

/** Dotted — light separation between rows. */
export const tileDotted = '·';

/** Tape — alternating filled/space, evokes warning tape. Use sparingly. */
export const tileTape = '▓░';

/** Dashes — used between data groups. */
export const tileDashed = '─ ';

/** All tiles, indexed by name. */
export const dividerTiles = {
  solid: tileSolid,
  line: tileLine,
  dotted: tileDotted,
  tape: tileTape,
  dashed: tileDashed,
} as const;

export type DividerStyle = keyof typeof dividerTiles;

/**
 * Repeat a tile to fill a target column count. The result is exactly `cols` chars wide
 * (any partial tile is truncated). Suitable for static rendering; for fluid layouts,
 * use a CSS-tiled background instead.
 */
export function divider(cols: number, style: DividerStyle = 'line'): string {
  const tile = dividerTiles[style];
  const repeats = Math.ceil(cols / tile.length);
  return tile.repeat(repeats).slice(0, cols);
}
