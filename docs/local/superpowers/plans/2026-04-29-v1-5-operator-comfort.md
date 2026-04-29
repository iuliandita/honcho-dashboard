# v1.5.0 Operator Comfort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Add optional shared-password dashboard auth, browser-aware settings, font scale presets, and complete
English/German localization for `honcho-dashboard` v1.5.0.

**Architecture:** Keep the app as a static SvelteKit SPA served by the Hono BFF. Client settings own theme,
font scale, and locale with localStorage persistence and browser preference detection. The Hono BFF owns
password auth, signed HTTP-only sessions, and protection of proxied Honcho API requests while leaving the
static app shell public.

**Tech Stack:** Bun · TypeScript · Svelte 5 runes · SvelteKit static adapter · Hono · Tailwind v4 CSS tokens ·
TanStack Query · Vitest · Playwright · `@axe-core/playwright` · Biome

**Spec reference:** `docs/local/superpowers/specs/2026-04-29-v1-5-operator-comfort-design.md`

---

## File Structure

Create or modify these files:

```text
src/lib/settings/
├── preferences.ts              # pure preference types, validation, browser detection, localStorage helpers
└── AppSettings.svelte.ts       # Svelte-rune settings store used by layout and auth screens

src/lib/i18n/
├── catalogs/en.ts              # English message catalog
├── catalogs/de.ts              # German message catalog with proper umlauts and ß
├── catalog.test.ts             # missing-key and locale metadata tests
└── index.ts                    # locale metadata, translate(), interpolation, key types

src/lib/auth/
├── api.ts                      # client helpers for /api/auth/status, /login, /logout
├── AuthGate.svelte             # renders login screen when auth is enabled and unauthenticated
└── LoginScreen.svelte          # password form with language selector

src/lib/ui/primitives/
└── SettingsMenu.svelte         # chrome control for theme, font scale, language, logout

src/server/auth/
├── config.ts                   # env parsing and auth-mode validation
├── password.ts                 # plaintext and hash verification helpers
├── session.ts                  # signed stateless session cookie helpers
├── route.ts                    # /api/auth/status, /login, /logout
└── middleware.ts               # protects /api/v3/* when auth is enabled

src/routes/+layout.svelte       # wire settings, i18n, AuthGate, SettingsMenu
src/lib/ui/tokens.css           # add data-font-scale token overrides
src/server/index.ts             # mount auth routes and middleware before proxy
src/server/runtime-config.ts    # keep public bootstrap config non-sensitive
deploy/k8s/*                    # add auth env examples
deploy/helm/honcho-dashboard/*  # add auth values, schema, templates, docs
README.md                       # document auth, theme, font scale, locale behavior

tests/lib/settings/preferences.test.ts
tests/lib/auth/api.test.ts
tests/server/auth/*.test.ts
tests/server/app.test.ts
tests/e2e/auth-flow.spec.ts
tests/e2e/settings-flow.spec.ts
tests/e2e/accessibility.spec.ts
```

Do not add OIDC, user accounts, role logic, server-side preference storage, or density presets.

---

## Task 1: Client Settings Foundation

**Files:**
- Create: `src/lib/settings/preferences.ts`
- Create: `src/lib/settings/AppSettings.svelte.ts`
- Create: `tests/lib/settings/preferences.test.ts`

- [ ] **Step 1: Write preference tests**

Create `tests/lib/settings/preferences.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
bun run test tests/lib/settings/preferences.test.ts
```

Expected: FAIL because `src/lib/settings/preferences.ts` does not exist.

- [ ] **Step 3: Implement pure preference helpers**

Create `src/lib/settings/preferences.ts`:

```ts
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

export function detectInitialTheme(
  stored: Theme | null,
  matchMedia: MatchMediaLike | null | undefined,
): Theme {
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
```

- [ ] **Step 4: Implement the Svelte settings store**

Create `src/lib/settings/AppSettings.svelte.ts`:

```ts
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
```

- [ ] **Step 5: Run tests**

Run:

```bash
bun run test tests/lib/settings/preferences.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/settings tests/lib/settings
git commit -m "feat(settings): add browser-aware display preferences"
```

---

## Task 2: Font Scale CSS Tokens

**Files:**
- Modify: `src/lib/ui/tokens.css`
- Modify: `src/routes/style-guide/+page.svelte`
- Modify: `tests/e2e/touch-targets.spec.ts`

- [ ] **Step 1: Add font-scale token overrides**

Modify `src/lib/ui/tokens.css` after the `:root` block:

```css
:root[data-font-scale="small"] {
  --text-2xs: 0.625rem;
  --text-xs: 0.6875rem;
  --text-sm: 0.75rem;
  --text-base: 0.8125rem;
  --text-lg: 0.9375rem;
  --text-xl: 1.0625rem;
  --text-2xl: 1.25rem;
}

:root[data-font-scale="large"] {
  --text-2xs: 0.75rem;
  --text-xs: 0.8125rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
}

:root[data-font-scale="extra-large"] {
  --text-2xs: 0.8125rem;
  --text-xs: 0.875rem;
  --text-sm: 1rem;
  --text-base: 1.125rem;
  --text-lg: 1.25rem;
  --text-xl: 1.4375rem;
  --text-2xl: 1.75rem;
}
```

- [ ] **Step 2: Add font-scale visibility to the style guide**

Modify `src/routes/style-guide/+page.svelte` so the token gallery includes the active root scale:

```ts
let activeFontScale = $state('normal');

onMount(() => {
  const style = getComputedStyle(document.documentElement);
  const next: Record<string, string> = {};
  for (const token of [...colorTokens, ...textTokens]) {
    next[token] = style.getPropertyValue(`--${token}`).trim();
  }
  next['font-mono'] = style.getPropertyValue('--font-mono').trim();
  resolved = next;
  activeFontScale = document.documentElement.dataset.fontScale ?? 'normal';
});
```

Then append `font scale: <code>{activeFontScale}</code>` to the existing subtitle.

- [ ] **Step 3: Run checks**

Run:

```bash
bun run check
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/ui/tokens.css src/routes/style-guide/+page.svelte
git commit -m "feat(settings): add font scale presets"
```

---

## Task 3: Settings Menu And i18n Infrastructure

**Files:**
- Create: `src/lib/i18n/catalogs/en.ts`
- Create: `src/lib/i18n/catalogs/de.ts`
- Create: `src/lib/i18n/index.ts`
- Create: `src/lib/i18n/catalog.test.ts`
- Create: `src/lib/ui/primitives/SettingsMenu.svelte`
- Create: `tests/e2e/settings-flow.spec.ts`
- Modify: `src/routes/+layout.svelte`
- Modify: `src/lib/ui/pixel/index.ts`
- Modify: `src/lib/ui/pixel/grids.ts`

- [ ] **Step 1: Write catalog tests**

Create `src/lib/i18n/catalog.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the failing catalog tests**

Run:

```bash
bun run test src/lib/i18n/catalog.test.ts
```

Expected: FAIL because the i18n module does not exist.

- [ ] **Step 3: Add English catalog**

Create `src/lib/i18n/catalogs/en.ts`:

```ts
export const en = {
  'app.name': 'honcho-dashboard',
  'settings.open': 'settings',
  'settings.theme': 'theme',
  'settings.theme.dark': 'dark',
  'settings.theme.light': 'light',
  'settings.fontScale': 'font size',
  'settings.fontScale.small': 'small',
  'settings.fontScale.normal': 'normal',
  'settings.fontScale.large': 'large',
  'settings.fontScale.extra-large': 'extra large',
  'settings.language': 'language',
  'settings.logout': 'log out',
  'auth.password': 'password',
  'auth.submit': 'unlock dashboard',
  'auth.failed': 'Password did not match.',
  'auth.required': 'Dashboard access is protected.',
  'nav.workspaces': 'workspaces',
  'nav.peers': 'peers',
  'nav.sessions': 'sessions',
  'nav.representation': 'representation',
  'nav.profile': 'profile',
  'nav.chat': 'chat',
  'nav.search': 'search',
  'mode.picker': 'picker',
  'mode.picker.description': 'no workspace pinned',
  'mode.pinned': 'pinned',
  'mode.pinned.workspace': 'workspace',
  'state.loading': 'loading',
  'state.error': 'error',
  'state.empty': 'empty',
} as const;
```

- [ ] **Step 4: Add German catalog**

Create `src/lib/i18n/catalogs/de.ts`:

```ts
export const de = {
  'app.name': 'honcho-dashboard',
  'settings.open': 'Einstellungen',
  'settings.theme': 'Darstellung',
  'settings.theme.dark': 'Dunkel',
  'settings.theme.light': 'Hell',
  'settings.fontScale': 'Schriftgröße',
  'settings.fontScale.small': 'Klein',
  'settings.fontScale.normal': 'Normal',
  'settings.fontScale.large': 'Groß',
  'settings.fontScale.extra-large': 'Sehr groß',
  'settings.language': 'Sprache',
  'settings.logout': 'Abmelden',
  'auth.password': 'Passwort',
  'auth.submit': 'Dashboard entsperren',
  'auth.failed': 'Das Passwort stimmt nicht.',
  'auth.required': 'Der Zugriff auf das Dashboard ist geschützt.',
  'nav.workspaces': 'Arbeitsbereiche',
  'nav.peers': 'Peers',
  'nav.sessions': 'Sitzungen',
  'nav.representation': 'Darstellung',
  'nav.profile': 'Profil',
  'nav.chat': 'Chat',
  'nav.search': 'Suche',
  'mode.picker': 'Auswahl',
  'mode.picker.description': 'kein Arbeitsbereich angeheftet',
  'mode.pinned': 'Angeheftet',
  'mode.pinned.workspace': 'Arbeitsbereich',
  'state.loading': 'Lädt',
  'state.error': 'Fehler',
  'state.empty': 'Leer',
} as const;
```

- [ ] **Step 5: Add translation helper**

Create `src/lib/i18n/index.ts`:

```ts
import type { Locale } from '$lib/settings/preferences';
import { de } from './catalogs/de';
import { en } from './catalogs/en';

export const catalogs = { en, de } as const;
export type MessageKey = keyof typeof en;

export const localeOptions: Array<{ locale: Locale; label: string }> = [
  { locale: 'en', label: 'English' },
  { locale: 'de', label: 'Deutsch' },
];

export function t(locale: Locale, key: MessageKey): string {
  return catalogs[locale][key] ?? catalogs.en[key];
}
```

- [ ] **Step 6: Add a settings pixel icon**

Add `'settings'` to `iconNames` in `src/lib/ui/pixel/index.ts`, and add this grid to
`src/lib/ui/pixel/grids.ts`:

```ts
settings: [
  '................',
  '................',
  '......####......',
  '.....######.....',
  '....##.##.##....',
  '..###..##..###..',
  '..##........##..',
  '..##..####..##..',
  '..##..####..##..',
  '..##........##..',
  '..###..##..###..',
  '....##.##.##....',
  '.....######.....',
  '......####......',
  '................',
  '................',
],
```

- [ ] **Step 7: Add `SettingsMenu`**

Create `src/lib/ui/primitives/SettingsMenu.svelte`:

```svelte
<script lang="ts">
import Icon from '$ui/pixel/Icon.svelte';
import { FONT_SCALES, THEMES } from '$lib/settings/preferences';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import { localeOptions, t, type MessageKey } from '$lib/i18n';

interface Props {
  settings: AppSettings;
  authEnabled: boolean;
  onLogout?: () => void | Promise<void>;
}

const { settings, authEnabled, onLogout }: Props = $props();
let open = $state(false);
</script>

<div class="settings">
  <button
    type="button"
    class="trigger"
    aria-expanded={open}
    aria-label={t(settings.locale, 'settings.open')}
    onclick={() => (open = !open)}
  >
    <Icon name="settings" size={14} />
    <span>{localeOptions.find((option) => option.locale === settings.locale)?.label ?? 'English'}</span>
  </button>

  {#if open}
    <div class="panel">
      <label>
        <span>{t(settings.locale, 'settings.theme')}</span>
        <select
          value={settings.theme}
          onchange={(event) => settings.setTheme(event.currentTarget.value as never)}
        >
          {#each THEMES as theme}
            <option value={theme}>{t(settings.locale, `settings.theme.${theme}` as MessageKey)}</option>
          {/each}
        </select>
      </label>

      <label>
        <span>{t(settings.locale, 'settings.fontScale')}</span>
        <select
          value={settings.fontScale}
          onchange={(event) => settings.setFontScale(event.currentTarget.value as never)}
        >
          {#each FONT_SCALES as scale}
            <option value={scale}>{t(settings.locale, `settings.fontScale.${scale}` as MessageKey)}</option>
          {/each}
        </select>
      </label>

      <label>
        <span>{t(settings.locale, 'settings.language')}</span>
        <select value={settings.locale} onchange={(event) => settings.setLocale(event.currentTarget.value as never)}>
          {#each localeOptions as option}
            <option value={option.locale}>{option.label}</option>
          {/each}
        </select>
      </label>

      {#if authEnabled && onLogout}
        <button type="button" class="logout" onclick={onLogout}>{t(settings.locale, 'settings.logout')}</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .settings {
    position: relative;
  }
  .trigger {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-fg);
    font: inherit;
    font-size: var(--text-xs);
    cursor: pointer;
  }
  .trigger:hover {
    border-color: var(--color-yellow-500);
    color: var(--color-yellow-500);
  }
  .panel {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    z-index: 10;
    width: min(18rem, calc(100vw - 2rem));
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    display: grid;
    gap: 0.75rem;
  }
  label {
    display: grid;
    gap: 0.25rem;
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
  }
  select,
  .logout {
    min-height: 44px;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-fg);
    font: inherit;
  }
  .logout {
    cursor: pointer;
  }
</style>
```

- [ ] **Step 8: Wire settings into the root layout**

Modify `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
import '$ui/fonts.css';
import '$ui/tokens.css';
import BrandMark from '$ui/ascii/BrandMark.svelte';
import { AppSettings } from '$lib/settings/AppSettings.svelte';
import SettingsMenu from '$ui/primitives/SettingsMenu.svelte';
import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
import { setContext } from 'svelte';
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();
const settings = new AppSettings();
setContext('app-settings', settings);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

$effect(() => settings.apply());
</script>
```

Keep the existing chrome, but replace the old theme-only button with:

```svelte
<SettingsMenu {settings} authEnabled={false} />
```

- [ ] **Step 9: Add settings e2e coverage**

Create `tests/e2e/settings-flow.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('settings preferences', () => {
  let stub: Awaited<ReturnType<typeof startStubHoncho>>;
  let dashboard: Awaited<ReturnType<typeof startDashboard>>;

  test.beforeAll(async () => {
    stub = await startStubHoncho();
    dashboard = await startDashboard({ apiBase: stub.url, workspaceId: 'ws-alpha' });
  });

  test.afterAll(async () => {
    await dashboard?.stop();
    await stub?.stop();
  });

  test('applies stored extra-large font scale before rendering', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('fontScale', 'extra-large'));
    await page.goto(`${dashboard.url}/peers`);
    await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'extra-large');
    const size = await page.locator('body').evaluate((node) => getComputedStyle(node).fontSize);
    expect(Number.parseFloat(size)).toBeGreaterThan(14);
  });

  test('uses saved German locale over an English browser preference', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'languages', { value: ['en-US'] });
      localStorage.setItem('locale', 'de');
    });
    await page.goto(`${dashboard.url}/peers`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });
});
```

- [ ] **Step 10: Run tests and checks**

Run:

```bash
bun run test src/lib/i18n/catalog.test.ts tests/lib/settings/preferences.test.ts
bun run check
bun run test:e2e -- tests/e2e/settings-flow.spec.ts
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add src/lib/i18n src/lib/ui/primitives/SettingsMenu.svelte src/lib/ui/pixel
git add src/routes/+layout.svelte tests/e2e/settings-flow.spec.ts
git commit -m "feat(i18n): add bilingual settings foundation"
```

---

## Task 4: Migrate Visible UI Copy To Catalogs

**Files:**
- Modify: `src/routes/**/*.svelte`
- Modify: `src/lib/route-shared/*.svelte`
- Modify: `src/lib/features/**/*.svelte`
- Modify: `src/lib/ui/primitives/*.svelte`
- Modify: `src/lib/i18n/catalogs/en.ts`
- Modify: `src/lib/i18n/catalogs/de.ts`
- Modify: `tests/e2e/settings-flow.spec.ts`

- [ ] **Step 1: Find visible hardcoded strings**

Run:

```bash
rg -n \">[a-zA-Z][^<{}]*<|title=\\\"|subtitle=\\\"|aria-label=\\\"|placeholder=\\\"\" src/routes src/lib
```

Expected: output includes current visible labels such as `sessions`, `search`, `no workspace pinned`, and
empty-state copy.

- [ ] **Step 2: Add route and feature keys**

Extend both catalogs with keys for every visible dashboard label. Use these German translations:

```ts
{
  'browser.noWorkspaces': 'Keine Arbeitsbereiche gefunden',
  'browser.noPeers': 'Keine Peers gefunden',
  'browser.noSessions': 'Keine Sitzungen für diesen Peer',
  'browser.loadMore': 'Mehr laden',
  'messages.title': 'Nachrichten',
  'messages.empty': 'Keine Nachrichten in dieser Sitzung',
  'representation.title': 'Darstellung',
  'representation.empty': 'Keine Darstellung gefunden',
  'representation.topic': 'Thema',
  'profile.title': 'Profil',
  'profile.empty': 'Kein Profil gefunden',
  'chat.title': 'Chat',
  'chat.prompt': 'Honcho zu diesem Peer fragen',
  'chat.send': 'Senden',
  'chat.cancel': 'Abbrechen',
  'chat.empty': 'Stelle eine Frage zu diesem Peer.',
  'search.title': 'Suche',
  'search.placeholder': 'Arbeitsbereich durchsuchen',
  'search.empty': 'Keine Treffer',
  'search.topicFilter': 'Themenfilter',
  'error.retry': 'Erneut versuchen',
  'error.traceId': 'Trace-ID'
}
```

Add matching English keys in `en.ts` with the current English wording.

- [ ] **Step 3: Replace strings in Svelte components**

For each touched component, import `getContext` and the translation helper:

```ts
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import { getContext } from 'svelte';

const settings = getContext<AppSettings>('app-settings');
```

Then replace visible strings with `t(settings.locale, 'message.key')`. Keep Honcho-provided content unchanged:
workspace IDs, peer IDs, session IDs, message bodies, markdown, conclusions, and chat responses.

- [ ] **Step 4: Add German e2e coverage**

Extend `tests/e2e/settings-flow.spec.ts`:

```ts
test('persists German locale in the running app', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('locale', 'de'));
  await page.goto(`${dashboard.url}/peers`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('link', { name: 'Suche' })).toBeVisible();
});
```

- [ ] **Step 5: Run validation**

Run:

```bash
bun run test src/lib/i18n/catalog.test.ts
bun run check
bun run test:e2e -- tests/e2e/settings-flow.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src tests/e2e/settings-flow.spec.ts
git commit -m "feat(i18n): localize dashboard chrome"
```

---

## Task 5: Server Auth Core

**Files:**
- Create: `src/server/auth/config.ts`
- Create: `src/server/auth/password.ts`
- Create: `src/server/auth/session.ts`
- Create: `src/server/auth/route.ts`
- Create: `src/server/auth/middleware.ts`
- Create: `tests/server/auth/config.test.ts`
- Create: `tests/server/auth/session.test.ts`
- Create: `tests/server/auth/route.test.ts`
- Modify: `src/server/index.ts`
- Modify: `tests/server/app.test.ts`

- [ ] **Step 1: Write auth config tests**

Create `tests/server/auth/config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { readAuthConfig } from '../../../src/server/auth/config';

describe('readAuthConfig', () => {
  it('defaults auth to off', () => {
    expect(readAuthConfig({})).toEqual({ mode: 'off' });
  });

  it('requires a password and session secret for password mode', () => {
    expect(() => readAuthConfig({ DASHBOARD_AUTH_MODE: 'password' })).toThrow(/DASHBOARD_SESSION_SECRET/);
  });

  it('accepts plaintext password mode for simple deployments', () => {
    expect(
      readAuthConfig({
        DASHBOARD_AUTH_MODE: 'password',
        DASHBOARD_AUTH_PASSWORD: 'secret',
        DASHBOARD_SESSION_SECRET: '0123456789abcdef0123456789abcdef',
      }),
    ).toMatchObject({ mode: 'password', password: 'secret' });
  });
});
```

- [ ] **Step 2: Implement auth config**

Create `src/server/auth/config.ts`:

```ts
export type AuthConfig =
  | { mode: 'off' }
  | {
      mode: 'password';
      password?: string;
      passwordHash?: string;
      sessionSecret: string;
      sessionTtlSeconds: number;
      cookieName: string;
    };

export function readAuthConfig(env: Record<string, string | undefined> = process.env): AuthConfig {
  const mode = env.DASHBOARD_AUTH_MODE ?? 'off';
  if (mode === 'off') return { mode: 'off' };
  if (mode !== 'password') throw new Error(`Unsupported DASHBOARD_AUTH_MODE: ${mode}`);

  const sessionSecret = env.DASHBOARD_SESSION_SECRET;
  if (!sessionSecret) throw new Error('Missing required env var: DASHBOARD_SESSION_SECRET');

  const password = env.DASHBOARD_AUTH_PASSWORD;
  const passwordHash = env.DASHBOARD_AUTH_PASSWORD_HASH;
  if (!password && !passwordHash) {
    throw new Error('Set DASHBOARD_AUTH_PASSWORD or DASHBOARD_AUTH_PASSWORD_HASH when password auth is enabled');
  }

  return {
    mode: 'password',
    password,
    passwordHash,
    sessionSecret,
    sessionTtlSeconds: Number.parseInt(env.DASHBOARD_SESSION_TTL_SECONDS ?? '43200', 10),
    cookieName: env.DASHBOARD_SESSION_COOKIE ?? 'honcho_dashboard_session',
  };
}
```

- [ ] **Step 3: Add session tests**

Create `tests/server/auth/session.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createSessionCookie, verifySessionCookie } from '../../../src/server/auth/session';

describe('session cookies', () => {
  it('verifies a signed session token', async () => {
    const token = await createSessionCookie({ secret: 'secret-value', ttlSeconds: 60, now: 1000 });
    await expect(verifySessionCookie(token.value, { secret: 'secret-value', now: 1000 })).resolves.toBe(true);
  });

  it('rejects an expired token', async () => {
    const token = await createSessionCookie({ secret: 'secret-value', ttlSeconds: 1, now: 1000 });
    await expect(verifySessionCookie(token.value, { secret: 'secret-value', now: 3000 })).resolves.toBe(false);
  });
});
```

- [ ] **Step 4: Implement signed session helpers**

Create `src/server/auth/session.ts`:

```ts
const encoder = new TextEncoder();

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return btoa(String.fromCharCode(...data)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return base64url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

export async function createSessionCookie(options: { secret: string; ttlSeconds: number; now?: number }) {
  const now = options.now ?? Date.now();
  const expiresAt = now + options.ttlSeconds * 1000;
  const nonce = crypto.randomUUID();
  const payload = `${expiresAt}.${nonce}`;
  const signature = await sign(payload, options.secret);
  return { value: `${payload}.${signature}`, expiresAt };
}

export async function verifySessionCookie(
  value: string | undefined | null,
  options: { secret: string; now?: number },
): Promise<boolean> {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [expiresAtText, nonce, signature] = parts;
  const expiresAt = Number.parseInt(expiresAtText ?? '', 10);
  if (!Number.isFinite(expiresAt) || expiresAt <= (options.now ?? Date.now())) return false;
  const expected = await sign(`${expiresAt}.${nonce}`, options.secret);
  return expected === signature;
}
```

- [ ] **Step 5: Implement password verification**

Create `src/server/auth/password.ts`:

```ts
import type { AuthConfig } from './config';

export async function verifyPassword(config: AuthConfig, candidate: string): Promise<boolean> {
  if (config.mode !== 'password') return false;
  if (config.passwordHash) return Bun.password.verify(candidate, config.passwordHash);
  return candidate === config.password;
}
```

- [ ] **Step 6: Implement auth route**

Create `src/server/auth/route.ts`:

```ts
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { Hono } from 'hono';
import type { AuthConfig } from './config';
import { createSessionCookie, verifySessionCookie } from './session';
import { verifyPassword } from './password';

export function authRoute(config: AuthConfig) {
  return new Hono()
    .get('/api/auth/status', async (c) => {
      const authenticated =
        config.mode === 'password'
          ? await verifySessionCookie(getCookie(c, config.cookieName), { secret: config.sessionSecret })
          : true;
      return c.json({ enabled: config.mode === 'password', authenticated });
    })
    .post('/api/auth/login', async (c) => {
      if (config.mode === 'off') return c.json({ authenticated: true });
      const body = (await c.req.json().catch(() => ({}))) as { password?: string };
      if (!body.password || !(await verifyPassword(config, body.password))) {
        return c.json({ error: 'invalid password' }, 401);
      }
      const session = await createSessionCookie({
        secret: config.sessionSecret,
        ttlSeconds: config.sessionTtlSeconds,
      });
      setCookie(c, config.cookieName, session.value, {
        httpOnly: true,
        sameSite: 'Strict',
        secure: c.req.header('x-forwarded-proto') === 'https' || new URL(c.req.url).protocol === 'https:',
        path: '/',
        maxAge: config.sessionTtlSeconds,
      });
      return c.json({ authenticated: true });
    })
    .post('/api/auth/logout', (c) => {
      if (config.mode === 'password') {
        deleteCookie(c, config.cookieName, { path: '/' });
      }
      return c.json({ authenticated: false });
    });
}
```

- [ ] **Step 7: Implement auth middleware**

Create `src/server/auth/middleware.ts`:

```ts
import { getCookie } from 'hono/cookie';
import type { MiddlewareHandler } from 'hono';
import type { AuthConfig } from './config';
import { verifySessionCookie } from './session';

export function authMiddleware(config: AuthConfig): MiddlewareHandler {
  return async (c, next) => {
    if (config.mode === 'off') return next();
    const authenticated = await verifySessionCookie(getCookie(c, config.cookieName), {
      secret: config.sessionSecret,
    });
    if (!authenticated) return c.json({ error: 'authentication required', status: 401 }, 401);
    return next();
  };
}
```

- [ ] **Step 8: Wire auth into app composition**

Modify `src/server/index.ts`:

```ts
import { authMiddleware } from './auth/middleware';
import { authRoute } from './auth/route';
import { readAuthConfig } from './auth/config';
```

Add `authConfig` to `AppConfig`, default it from `readAuthConfig()`, route auth before the proxy, and mount:

```ts
app.route('/', authRoute(config.authConfig));
app.use('/api/v3/*', authMiddleware(config.authConfig));
```

- [ ] **Step 9: Run server tests**

Run:

```bash
bun run test tests/server/auth tests/server/app.test.ts tests/server/proxy.test.ts
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/server/auth src/server/index.ts tests/server
git commit -m "feat(auth): add optional password gate"
```

---

## Task 6: Client Auth Gate And Login UI

**Files:**
- Create: `src/lib/auth/api.ts`
- Create: `src/lib/auth/AuthGate.svelte`
- Create: `src/lib/auth/LoginScreen.svelte`
- Create: `tests/lib/auth/api.test.ts`
- Create: `tests/e2e/auth-flow.spec.ts`
- Modify: `src/routes/+layout.svelte`
- Modify: `src/lib/i18n/catalogs/en.ts`
- Modify: `src/lib/i18n/catalogs/de.ts`

- [ ] **Step 1: Add auth client tests**

Create `tests/lib/auth/api.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { fetchAuthStatus, login, logout } from '../../../src/lib/auth/api';

describe('auth api', () => {
  it('fetches auth status', async () => {
    const fetch = vi.fn(async () => Response.json({ enabled: true, authenticated: false }));
    await expect(fetchAuthStatus({ fetch })).resolves.toEqual({ enabled: true, authenticated: false });
    expect(fetch).toHaveBeenCalledWith('/api/auth/status', { headers: { Accept: 'application/json' } });
  });

  it('posts login and logout requests', async () => {
    const fetch = vi.fn(async () => Response.json({ authenticated: true }));
    await login('secret', { fetch });
    await logout({ fetch });
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }));
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST' }));
  });
});
```

- [ ] **Step 2: Implement auth client helpers**

Create `src/lib/auth/api.ts`:

```ts
import { parseErrorBody } from '$api/errors';

export interface AuthStatus {
  enabled: boolean;
  authenticated: boolean;
}

export interface AuthApiOptions {
  fetch?: typeof fetch;
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await parseErrorBody(res);
  return (await res.json()) as T;
}

export function fetchAuthStatus(options: AuthApiOptions = {}) {
  const fetcher = options.fetch ?? fetch;
  return fetcher('/api/auth/status', { headers: { Accept: 'application/json' } }).then((res) => parse<AuthStatus>(res));
}

export function login(password: string, options: AuthApiOptions = {}) {
  const fetcher = options.fetch ?? fetch;
  return fetcher('/api/auth/login', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then((res) => parse<{ authenticated: true }>(res));
}

export function logout(options: AuthApiOptions = {}) {
  const fetcher = options.fetch ?? fetch;
  return fetcher('/api/auth/logout', { method: 'POST', headers: { Accept: 'application/json' } }).then((res) =>
    parse<{ authenticated: false }>(res),
  );
}
```

- [ ] **Step 3: Add login UI**

Create `src/lib/auth/LoginScreen.svelte`:

```svelte
<script lang="ts">
import BrandMark from '$ui/ascii/BrandMark.svelte';
import { localeOptions, t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';

interface Props {
  settings: AppSettings;
  onSubmit: (password: string) => Promise<void>;
}

const { settings, onSubmit }: Props = $props();
let password = $state('');
let error = $state(false);
let pending = $state(false);

async function submit() {
  pending = true;
  error = false;
  try {
    await onSubmit(password);
  } catch {
    error = true;
  } finally {
    pending = false;
  }
}
</script>

<main class="login">
  <form class="panel" onsubmit={(event) => { event.preventDefault(); void submit(); }}>
    <BrandMark />
    <p>{t(settings.locale, 'auth.required')}</p>

    <label>
      <span>{t(settings.locale, 'settings.language')}</span>
      <select value={settings.locale} onchange={(event) => settings.setLocale(event.currentTarget.value as never)}>
        {#each localeOptions as option}
          <option value={option.locale}>{option.label}</option>
        {/each}
      </select>
    </label>

    <label>
      <span>{t(settings.locale, 'auth.password')}</span>
      <input bind:value={password} type="password" autocomplete="current-password" />
    </label>

    {#if error}
      <p class="error">{t(settings.locale, 'auth.failed')}</p>
    {/if}

    <button type="submit" disabled={pending}>{t(settings.locale, 'auth.submit')}</button>
  </form>
</main>
```

Add CSS in the same file so `.login` centers the panel, `.panel` uses the existing square bordered terminal
style, and `input`, `select`, and `button` keep 44px minimum touch targets.

- [ ] **Step 4: Add auth gate**

Create `src/lib/auth/AuthGate.svelte`:

```svelte
<script lang="ts">
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import LoginScreen from './LoginScreen.svelte';
import { fetchAuthStatus, login, logout } from './api';
import type { Snippet } from 'svelte';

export interface AuthControls {
  enabled: boolean;
  logout: () => Promise<void>;
}

interface Props {
  settings: AppSettings;
  children: Snippet<[AuthControls]>;
}

const { settings, children }: Props = $props();
let enabled = $state(false);
let authenticated = $state(false);
let loading = $state(true);

async function refresh() {
  const status = await fetchAuthStatus();
  enabled = status.enabled;
  authenticated = status.authenticated;
  loading = false;
}

async function submit(password: string) {
  await login(password);
  authenticated = true;
}

export async function signOut() {
  await logout();
  authenticated = false;
}

$effect(() => {
  void refresh();
});
</script>

{#if loading}
  <main class="auth-loading">loading</main>
{:else if enabled && !authenticated}
  <LoginScreen {settings} onSubmit={submit} />
{:else}
  {@render children({ enabled, logout: signOut })}
{/if}
```

Modify `src/routes/+layout.svelte` so `AuthGate` wraps the chrome and main content:

```svelte
<QueryClientProvider client={queryClient}>
  <AuthGate {settings}>
    {#snippet children(auth)}
      <header class="chrome">
        <h1 class="sr-only">honcho-dashboard</h1>
        <span class="brand"><BrandMark /></span>
        <span class="rule" aria-hidden="true">─ ─ ─</span>
        <span class="version">v{data.runtimeConfig.version}</span>
        <span class="spacer"></span>
        <SettingsMenu {settings} authEnabled={auth.enabled} onLogout={auth.logout} />
      </header>

      <main class="main">
        {@render children()}
      </main>
    {/snippet}
  </AuthGate>
</QueryClientProvider>
```

Preserve the existing pinned-workspace chrome details when moving the header into the snippet.

- [ ] **Step 5: Extend e2e dashboard helper for auth env**

Modify `tests/e2e/helpers/stub-server.ts`:

```ts
export interface DashboardOptions {
  apiBase: string;
  adminToken?: string;
  workspaceId?: string | null;
  port?: number;
  env?: Record<string, string>;
}
```

Pass `options.env` into `startProcess`, and merge it into the spawned child environment:

```ts
async function startProcess(args: string[], env: Record<string, string> = {}): Promise<StartedServer> {
  const child = spawn('bun', ['run', serverEntry(), ...args], {
    cwd: process.cwd(),
    env: { ...process.env, LOG_LEVEL: 'silent', ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const url = await waitForReady(child);
  return { url, stop: () => stopProcess(child) };
}
```

Call `startProcess([...], options.env ?? {})` from `startDashboard`.

- [ ] **Step 6: Add Playwright auth flow**

Create `tests/e2e/auth-flow.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('password auth', () => {
  let stub: Awaited<ReturnType<typeof startStubHoncho>>;
  let dashboard: Awaited<ReturnType<typeof startDashboard>>;

  test.beforeAll(async () => {
    stub = await startStubHoncho();
    dashboard = await startDashboard({
      apiBase: stub.url,
      workspaceId: 'ws-alpha',
      env: {
        DASHBOARD_AUTH_MODE: 'password',
        DASHBOARD_AUTH_PASSWORD: 'secret',
        DASHBOARD_SESSION_SECRET: '0123456789abcdef0123456789abcdef',
      },
    });
  });

  test.afterAll(async () => {
    await dashboard?.stop();
    await stub?.stop();
  });

  test('logs in with English UI', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers`);
    await expect(page.getByText('Dashboard access is protected.')).toBeVisible();
    await page.getByLabel('password').fill('secret');
    await page.getByRole('button', { name: 'unlock dashboard' }).click();
    await expect(page.getByText('hermes')).toBeVisible();
  });

  test('allows German selection before login', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers`);
    await page.getByLabel('language').selectOption('de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await page.getByLabel('Passwort').fill('secret');
    await page.getByRole('button', { name: 'Dashboard entsperren' }).click();
    await expect(page.getByRole('link', { name: 'Suche' })).toBeVisible();
  });

  test('rejects a wrong password', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers`);
    await page.getByLabel('password').fill('wrong');
    await page.getByRole('button', { name: 'unlock dashboard' }).click();
    await expect(page.getByText('Password did not match.')).toBeVisible();
  });
});
```

- [ ] **Step 7: Run checks**

Run:

```bash
bun run test tests/lib/auth/api.test.ts
bun run test:e2e -- tests/e2e/auth-flow.spec.ts
bun run check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth src/routes/+layout.svelte src/lib/i18n tests/lib/auth tests/e2e
git commit -m "feat(auth): add localized login flow"
```

---

## Task 7: Deployment And Documentation

**Files:**
- Modify: `README.md`
- Modify: `deploy/k8s/configmap.yaml`
- Modify: `deploy/k8s/secret.example.yaml`
- Modify: `deploy/k8s/README.md`
- Modify: `deploy/helm/honcho-dashboard/values.yaml`
- Modify: `deploy/helm/honcho-dashboard/values.schema.json`
- Modify: `deploy/helm/honcho-dashboard/templates/configmap.yaml`
- Modify: `deploy/helm/honcho-dashboard/templates/secret.yaml`
- Modify: `deploy/helm/honcho-dashboard/README.md`

- [ ] **Step 1: Update Kubernetes config examples**

Add to `deploy/k8s/configmap.yaml`:

```yaml
  DASHBOARD_AUTH_MODE: 'off'          # set to 'password' to enable shared-password auth
  DASHBOARD_SESSION_TTL_SECONDS: '43200'
```

Add to `deploy/k8s/secret.example.yaml`:

```yaml
  DASHBOARD_SESSION_SECRET: 'REPLACE_ME_with_32_plus_random_chars'
  # DASHBOARD_AUTH_PASSWORD_HASH is preferred for production-like installs.
  DASHBOARD_AUTH_PASSWORD: 'REPLACE_ME_with_dashboard_password'
```

- [ ] **Step 2: Update Helm values and schema**

Add a top-level `dashboardAuth` block:

```yaml
dashboardAuth:
  mode: off
  password: ''
  passwordHash: ''
  sessionSecret: ''
  sessionTtlSeconds: 43200
```

Update templates to emit non-secret auth mode and TTL into the ConfigMap, and password/password hash/session
secret into the Secret only when configured.

- [ ] **Step 3: Update README**

Document:

- Auth modes: `off` and `password`.
- `DASHBOARD_AUTH_PASSWORD_HASH` preferred, `DASHBOARD_AUTH_PASSWORD` accepted.
- `DASHBOARD_SESSION_SECRET` required for password mode.
- Browser theme detection with dark fallback and stored user override.
- Browser language detection for English/German and stored user override.
- Font scale options.

- [ ] **Step 4: Run docs/config validation**

Run:

```bash
bun run lint
bun run test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add README.md deploy
git commit -m "docs(deploy): document v1.5 operator settings"
```

---

## Task 8: Final Verification

**Files:**
- Modify only if verification exposes issues.

- [ ] **Step 1: Run full verification**

Run:

```bash
bun run check
bun run lint
bun run test
bun run test:e2e
```

Expected: all commands PASS.

- [ ] **Step 2: Manual smoke check**

Run:

```bash
bun run build
```

Then start the built app with password auth enabled:

```bash
DASHBOARD_AUTH_MODE=password \
DASHBOARD_AUTH_PASSWORD=secret \
DASHBOARD_SESSION_SECRET=0123456789abcdef0123456789abcdef \
HONCHO_API_BASE=http://127.0.0.1:8000 \
HONCHO_ADMIN_TOKEN=test-token \
bun run start
```

Open `http://localhost:3000`, verify the login screen renders, German can be selected before login, and the
app respects stored theme/font/language settings after login.

- [ ] **Step 3: Commit final fixes if needed**

If any verification fixes were required:

```bash
git status --short
git add README.md deploy src tests
git commit -m "fix(app): polish v1.5 operator comfort"
```

If no fixes were required, do not create an empty commit.
