/**
 * Page-header marks — 2-line glyph + label, consumed by `<PageMark>`.
 *
 * Each mark pairs a page-specific pixel glyph (left) with the page name
 * (right). Marks are intentionally sparse — they're a stamp, not a banner.
 * Plans 2–7 wire each into its corresponding route as the route lands.
 *
 * Polish pass in Plan 8 may swap glyphs. The glyph *positions* and the
 * `<PageMark>` API will not change.
 */

export const peersMark = `▟▙ ▟▙ ▟▙   peers
▝▘ ▝▘ ▝▘`;

export const sessionsMark = `●─●─○─○─●  sessions
              `;

export const representationMark = `┌┬┬┬┬┐     representation
└┴┴┴┴┘`;

export const profileMark = `┌─────┐    profile
│ ::: │
└─────┘`;

export const chatMark = `[  ][  ]   chat
   [    ]>`;

export const searchMark = ` ╭─╮       search
 ╰─╯╲`;

export const workspacesMark = `▤ ▤ ▤      workspaces
▤ ▤ ▤`;

/** Map by page slug for dynamic lookups. */
export const pageMarks = {
  peers: peersMark,
  sessions: sessionsMark,
  representation: representationMark,
  profile: profileMark,
  chat: chatMark,
  search: searchMark,
  workspaces: workspacesMark,
} as const;

export type PageMarkName = keyof typeof pageMarks;
