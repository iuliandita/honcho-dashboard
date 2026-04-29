import { getContext } from 'svelte';
import type { Locale } from './preferences';

export interface LocaleContext {
  locale: Locale;
}

const fallbackLocaleContext: LocaleContext = { locale: 'en' };

export function getLocaleContext(): LocaleContext {
  return getContext<LocaleContext | undefined>('app-settings') ?? fallbackLocaleContext;
}
