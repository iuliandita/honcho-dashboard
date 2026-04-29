import { describe, expect, it } from 'vitest';
import { catalogs, localeOptions, t } from './index';

describe('i18n catalogs', () => {
  it('has matching English and German keys', () => {
    const englishKeys = Object.keys(catalogs.en).sort();
    const germanKeys = Object.keys(catalogs.de).sort();
    expect(germanKeys).toEqual(englishKeys);
  });

  it('translates German text with proper characters', () => {
    expect(t('de', 'nav.workspaces')).toBe('Arbeitsbereiche');
    expect(t('de', 'settings.language')).toBe('Sprache');
    expect(t('de', 'auth.password')).toBe('Passwort');
  });

  it('exposes locale labels in their own language', () => {
    expect(localeOptions).toEqual([
      { locale: 'en', label: 'English' },
      { locale: 'de', label: 'Deutsch' },
    ]);
  });
});
