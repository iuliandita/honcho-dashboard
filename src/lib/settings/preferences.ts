export type Theme = 'dark' | 'light';
export type FontScale = 'small' | 'normal' | 'large' | 'extra-large';
export type Locale = 'en' | 'de';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type MatchMediaLike = (query: string) => { matches: boolean };

export const DEFAULT_THEME: Theme = 'dark';
export const DEFAULT_FONT_SCALE: FontScale = 'normal';
export const DEFAULT_LOCALE: Locale = 'en';

export const STORAGE_KEYS = {
  theme: 'theme',
  fontScale: 'fontScale',
  locale: 'locale',
} as const;

export const THEMES = ['dark', 'light'] as const satisfies readonly Theme[];
export const FONT_SCALES = ['small', 'normal', 'large', 'extra-large'] as const satisfies readonly FontScale[];
export const LOCALES = ['en', 'de'] as const satisfies readonly Locale[];

function isOneOf<T extends string>(value: string | null, allowed: readonly T[]): value is T {
  return value !== null && (allowed as readonly string[]).includes(value);
}

export function readStoredTheme(storage: StorageLike | null | undefined): Theme | null {
  const value = storage?.getItem(STORAGE_KEYS.theme) ?? null;
  return isOneOf(value, THEMES) ? value : null;
}

export function readStoredFontScale(storage: StorageLike | null | undefined): FontScale {
  const value = storage?.getItem(STORAGE_KEYS.fontScale) ?? null;
  return isOneOf(value, FONT_SCALES) ? value : DEFAULT_FONT_SCALE;
}

export function readStoredLocale(storage: StorageLike | null | undefined): Locale | null {
  const value = storage?.getItem(STORAGE_KEYS.locale) ?? null;
  return isOneOf(value, LOCALES) ? value : null;
}

export function detectInitialTheme(stored: Theme | null, matchMedia: MatchMediaLike | null | undefined): Theme {
  if (stored) return stored;
  if (matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  if (matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return DEFAULT_THEME;
}

export function detectInitialLocale(stored: Locale | null, languages: readonly string[] | null | undefined): Locale {
  if (stored) return stored;
  for (const language of languages ?? []) {
    const normalized = language.toLowerCase();
    if (normalized === 'de' || normalized.startsWith('de-')) return 'de';
    if (normalized === 'en' || normalized.startsWith('en-')) return 'en';
  }
  return DEFAULT_LOCALE;
}

export function writePreference(
  storage: StorageLike | null | undefined,
  key: keyof typeof STORAGE_KEYS,
  value: string,
) {
  storage?.setItem(STORAGE_KEYS[key], value);
}
