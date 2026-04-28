export type CanonicalRole = 'user' | 'assistant' | 'system' | 'other';

export function formatAbsolute(iso: string): string {
  if (!iso) return '—';
  return iso.slice(0, 19).replace('T', ' ');
}

export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((now.getTime() - then) / 1000));

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 7 * 86_400) return `${Math.floor(diffSec / 86_400)}d ago`;
  return iso.slice(0, 10);
}

export function normalizeRole(role: string): CanonicalRole {
  const normalized = role.toLowerCase();
  if (normalized === 'user' || normalized === 'assistant' || normalized === 'system') return normalized;
  return 'other';
}
