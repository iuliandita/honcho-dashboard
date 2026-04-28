/**
 * ASCII art barrel — single import point for all hand-rolled marks.
 *
 *   import { brandMark, errorMark, pageMarks, divider } from '$ui/ascii';
 *
 * Every mark assumes monospace rendering. Wrap consumers in `<pre class="ascii">`
 * (preferred) or any element with `class="font-ascii"`. Both classes are
 * defined in `tokens.css` and disable contextual ligatures so the art renders
 * as drawn.
 */

export { brandSigil, brandMark, brandBlock } from './brand';
export { errorMark, errorChip } from './error';
export { emptyArchive, emptyMemory, emptyMatch, emptyTransmit } from './empty';
export { dotsFrames, barFrames, cursorFrames, loadingMark } from './loading';
export { divider, dividerTiles, type DividerStyle } from './divider';
export {
  peersMark,
  sessionsMark,
  representationMark,
  profileMark,
  chatMark,
  searchMark,
  workspacesMark,
  pageMarks,
  type PageMarkName,
} from './pages';
