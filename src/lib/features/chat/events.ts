/**
 * Honcho dialectic chat SSE event shape. Manual single source of truth — OpenAPI describes the response
 * as opaque text/event-stream, so we shape these here. If the upstream protocol changes, edit this file.
 */
export type ChatEvent =
  | { type: 'token'; data: string }
  | { type: 'done' }
  | { type: 'error'; data: string };

export function isChatEvent(value: unknown): value is ChatEvent {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.type === 'token' && typeof v.data === 'string') return true;
  if (v.type === 'done') return true;
  if (v.type === 'error' && typeof v.data === 'string') return true;
  return false;
}
