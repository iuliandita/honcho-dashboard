import type { Locale } from '$lib/settings/preferences';
import { de } from './catalogs/de';
import { en } from './catalogs/en';

export const catalogs = { en, de } as const;
export type MessageKey = keyof typeof en;

export const localeOptions: Array<{ locale: Locale; label: string }> = [
  { locale: 'en', label: 'English' },
  { locale: 'de', label: 'Deutsch' },
];

export function t(locale: Locale, key: MessageKey, values: Record<string, string | number> = {}): string {
  let message: string = catalogs[locale][key] ?? catalogs.en[key];
  for (const [name, value] of Object.entries(values)) {
    message = message.replaceAll(`{${name}}`, String(value));
  }
  return message;
}
