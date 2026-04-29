import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FONT_SCALE,
  DEFAULT_LOCALE,
  type StorageLike,
  detectInitialLocale,
  detectInitialTheme,
  readStoredFontScale,
  readStoredLocale,
  readStoredTheme,
} from '../../../src/lib/settings/preferences';

function storage(values: Record<string, string> = {}): StorageLike {
  return {
    getItem: vi.fn((key: string) => values[key] ?? null),
    setItem: vi.fn(),
  };
}

describe('settings preferences', () => {
  it('uses stored theme before browser detection', () => {
    expect(readStoredTheme(storage({ theme: 'light' }))).toBe('light');
  });

  it('detects light theme from browser preference', () => {
    const matchMedia = vi.fn((query: string) => ({ matches: query === '(prefers-color-scheme: light)' }));
    expect(detectInitialTheme(null, matchMedia)).toBe('light');
  });

  it('defaults to dark when no browser theme preference is detected', () => {
    const matchMedia = vi.fn(() => ({ matches: false }));
    expect(detectInitialTheme(null, matchMedia)).toBe('dark');
  });

  it('uses stored locale before browser detection', () => {
    expect(readStoredLocale(storage({ locale: 'de' }))).toBe('de');
  });

  it('detects German and English browser locales', () => {
    expect(detectInitialLocale(null, ['de-DE', 'en-US'])).toBe('de');
    expect(detectInitialLocale(null, ['en-GB', 'de-DE'])).toBe('en');
  });

  it('defaults unsupported browser locales to English', () => {
    expect(detectInitialLocale(null, ['fr-FR'])).toBe(DEFAULT_LOCALE);
  });

  it('validates font scale from storage', () => {
    expect(readStoredFontScale(storage({ fontScale: 'large' }))).toBe('large');
    expect(readStoredFontScale(storage({ fontScale: 'huge' }))).toBe(DEFAULT_FONT_SCALE);
  });
});
