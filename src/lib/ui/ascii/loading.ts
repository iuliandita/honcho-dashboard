/**
 * Loading marks — animated via a separate `<LoadingMark>` component that
 * cycles the array on a timer. The strings here are *frames*; consumers pick
 * the cadence (typically 80–120ms per frame for spinners, 1.06s for cursor).
 *
 * Two visual languages:
 *   - `dotsFrames`   — three-dot ellipsis that fills then clears (8 frames).
 *   - `barFrames`    — terminal-style throbber bar (12 frames).
 *   - `cursorFrames` — solid block / nothing (the canonical text cursor blink).
 */

export const dotsFrames = ['.  ', '.. ', '...', ' ..', '  .', '   ', '.  ', '.. '] as const;

export const barFrames = [
  '[█         ]',
  '[██        ]',
  '[ ██       ]',
  '[  ██      ]',
  '[   ██     ]',
  '[    ██    ]',
  '[     ██   ]',
  '[      ██  ]',
  '[       ██ ]',
  '[        ██]',
  '[         █]',
  '[          ]',
] as const;

export const cursorFrames = ['█', ' '] as const;

/** Static "loading…" stamp — used when no animation is wanted. */
export const loadingMark = '╴ loading ╶ ─ ─ ─ ─';
