/**
 * Empty-state marks — drawn when a list/grid/result has zero items.
 *
 * Four variants, picked by context:
 *   - `emptyArchive`   — no peers / no sessions / no messages found
 *   - `emptyMemory`    — representation has no topics yet
 *   - `emptyMatch`     — search yielded nothing
 *   - `emptyTransmit`  — chat hasn't started yet
 *
 * Each is hand-rolled, ~5 lines, ~24 chars wide. Pair with terse subtitle copy
 * in the consuming component (component renders `<pre>` + `<p>`, not the art alone).
 */

/** Empty archive — bookshelf with one toppled volume. */
export const emptyArchive = `┌──┬──┬──┬──┬──┐
│  │  │  │  │  │
│  │  │  │  │  │
└──┴──┴──┴──┴──┘
   nothing here`;

/** Empty memory — outline of a brain-grid, empty cells. */
export const emptyMemory = `╶┬─┬─┬─┬─╴
 │ │ │ │
 ┼─┼─┼─┼
 │ │ │ │
 nothing learned yet`;

/** Empty match — magnifier over a blank field. */
export const emptyMatch = `      ╭───╮
      │   │
   ╶──┴───┘
   no matches`;

/** Empty transmit — empty terminal prompt with a blinking caret. */
export const emptyTransmit = ` $ honcho-chat
 > _

 dialectic stream is idle`;
