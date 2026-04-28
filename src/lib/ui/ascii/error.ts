/**
 * Error mark — replaces the placeholder in +error.svelte.
 *
 * Chunky ERROR in hand-rolled 3x3 block letters (with R borrowed from a
 * 4-wide variant for legibility — figlet didn't write this).
 *
 *   E:  █▀▀     R:  █▀▀█    O:  █▀▀█
 *       █▀▀         █▄▄▀        █  █
 *       █▄▄         ▀ ▀▀        ▀▀▀▀
 *
 * 23 chars wide, 3 lines. Sits unframed; the page's own rule lines are the frame.
 */
export const errorMark = `█▀▀ █▀▀█ █▀▀█ █▀▀█ █▀▀█
█▀▀ █▄▄▀ █▄▄▀ █  █ █▄▄▀
█▄▄ ▀ ▀▀ ▀ ▀▀ ▀▀▀▀ ▀ ▀▀`;

/** Compact one-line glyph for inline error chips / toasts. */
export const errorChip = '! fault';
