export const tileSolid = '═';
export const tileLine = '─';
export const tileDotted = '·';
export const tileTape = '▓░';
export const tileDashed = '─ ';

const dividerTiles = {
  solid: tileSolid,
  line: tileLine,
  dotted: tileDotted,
  tape: tileTape,
  dashed: tileDashed,
} as const;

export type DividerStyle = keyof typeof dividerTiles;

export function divider(cols: number, style: DividerStyle = 'line'): string {
  const tile = dividerTiles[style];
  const repeats = Math.ceil(cols / tile.length);
  return tile.repeat(repeats).slice(0, cols);
}
