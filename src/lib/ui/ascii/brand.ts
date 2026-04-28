/**
 * Brand marks — terminal-native lockups for the dashboard.
 *
 * All marks are composed in monospace: every glyph occupies exactly one column.
 * Mixing in proportional fallbacks (system-ui, etc.) will visibly fracture them.
 * Render inside `<pre class="ascii">` or any element with `class="font-ascii"`.
 */

/** Two-char sigil — used inline as a prefix glyph. */
export const brandSigil = '▙ ▟';

/** Single-row brand mark for the header chrome. */
export const brandMark = `${brandSigil}  honcho-dashboard`;

/** Multi-line brand block for splash / about / empty-app states. */
export const brandBlock = `▙ ▟     honcho
▘ ▝    .dashboard
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
 memory · inspector
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`;
