import {
  type FontScale,
  type Locale,
  STORAGE_KEYS,
  type Theme,
  detectInitialLocale,
  detectInitialTheme,
  readStoredFontScale,
  readStoredLocale,
  readStoredTheme,
} from './preferences';

function browserStorage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

function browserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages.length > 0 ? navigator.languages : [navigator.language];
}

function browserMatchMedia() {
  return typeof matchMedia === 'undefined' ? null : matchMedia.bind(globalThis);
}

export class AppSettings {
  theme = $state<Theme>(detectInitialTheme(readStoredTheme(browserStorage()), browserMatchMedia()));
  fontScale = $state<FontScale>(readStoredFontScale(browserStorage()));
  locale = $state<Locale>(detectInitialLocale(readStoredLocale(browserStorage()), browserLanguages()));

  apply() {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = this.theme;
    document.documentElement.dataset.fontScale = this.fontScale;
    document.documentElement.lang = this.locale;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    browserStorage()?.setItem(STORAGE_KEYS.theme, theme);
  }

  setFontScale(fontScale: FontScale) {
    this.fontScale = fontScale;
    browserStorage()?.setItem(STORAGE_KEYS.fontScale, fontScale);
  }

  setLocale(locale: Locale) {
    this.locale = locale;
    browserStorage()?.setItem(STORAGE_KEYS.locale, locale);
  }

  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }
}
