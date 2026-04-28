import { describe, expect, it } from 'vitest';
import { formatAbsolute, formatRelative, normalizeRole } from './format';

describe('formatAbsolute', () => {
  it('renders ISO date as YYYY-MM-DD HH:MM:SS', () => {
    expect(formatAbsolute('2026-04-28T12:34:56Z')).toBe('2026-04-28 12:34:56');
  });

  it('returns em-dash for empty', () => {
    expect(formatAbsolute('')).toBe('—');
  });
});

describe('formatRelative', () => {
  it('returns "just now" for <60s', () => {
    const now = new Date('2026-04-28T12:00:00Z');
    expect(formatRelative('2026-04-28T11:59:30Z', now)).toBe('just now');
  });

  it('returns minute count for <1h', () => {
    const now = new Date('2026-04-28T12:00:00Z');
    expect(formatRelative('2026-04-28T11:45:00Z', now)).toBe('15m ago');
  });

  it('returns hour count for <24h', () => {
    const now = new Date('2026-04-28T12:00:00Z');
    expect(formatRelative('2026-04-28T05:00:00Z', now)).toBe('7h ago');
  });

  it('returns day count for <7d', () => {
    const now = new Date('2026-04-28T12:00:00Z');
    expect(formatRelative('2026-04-25T12:00:00Z', now)).toBe('3d ago');
  });

  it('falls back to absolute date for >=7d', () => {
    const now = new Date('2026-04-28T12:00:00Z');
    expect(formatRelative('2026-04-01T12:00:00Z', now)).toBe('2026-04-01');
  });
});

describe('normalizeRole', () => {
  it('maps known roles to canonical lowercase', () => {
    expect(normalizeRole('User')).toBe('user');
    expect(normalizeRole('ASSISTANT')).toBe('assistant');
    expect(normalizeRole('system')).toBe('system');
  });

  it('falls back to "other" for unknown', () => {
    expect(normalizeRole('tool')).toBe('other');
    expect(normalizeRole('')).toBe('other');
  });
});
