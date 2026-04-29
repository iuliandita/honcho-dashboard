<script lang="ts">
import { type MessageKey, localeOptions, t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import { FONT_SCALES, type FontScale, type Locale, THEMES, type Theme } from '$lib/settings/preferences';
import type { IconName } from '$ui/pixel';
import Icon from '$ui/pixel/Icon.svelte';

interface Props {
  settings: AppSettings;
  authEnabled: boolean;
  onLogout?: () => void | Promise<void>;
}

const { settings, authEnabled, onLogout }: Props = $props();
// biome-ignore lint/style/useConst: button handlers reassign this Svelte rune state from markup.
let open = $state(false);

const themeIcons: Record<Theme, IconName> = {
  dark: 'moon',
  light: 'sun',
};

const fontScaleLabels: Record<FontScale, string> = {
  small: 'S',
  normal: 'N',
  large: 'L',
  'extra-large': 'XL',
};

function localeCode(locale: Locale): string {
  return locale.toUpperCase();
}
</script>

<div class="settings">
  <button
    type="button"
    class="trigger"
    aria-expanded={open}
    aria-label={t(settings.locale, 'settings.open')}
    title={t(settings.locale, 'settings.open')}
    onclick={() => (open = !open)}
  >
    <Icon name="settings" size={16} />
  </button>

  {#if open}
    <div class="panel">
      <fieldset>
        <legend>{t(settings.locale, 'settings.theme')}</legend>
        <div class="segment two">
          {#each THEMES as theme}
            <button
              type="button"
              class="icon-choice"
              class:active={settings.theme === theme}
              aria-label={t(settings.locale, `settings.theme.${theme}` as MessageKey)}
              aria-pressed={settings.theme === theme}
              title={t(settings.locale, `settings.theme.${theme}` as MessageKey)}
              onclick={() => settings.setTheme(theme)}
            >
              <Icon name={themeIcons[theme]} size={18} />
            </button>
          {/each}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t(settings.locale, 'settings.fontScale')}</legend>
        <div class="segment four">
          {#each FONT_SCALES as scale}
            <button
              type="button"
              class:active={settings.fontScale === scale}
              aria-label={t(settings.locale, `settings.fontScale.${scale}` as MessageKey)}
              aria-pressed={settings.fontScale === scale}
              title={t(settings.locale, `settings.fontScale.${scale}` as MessageKey)}
              onclick={() => settings.setFontScale(scale)}
            >
              {fontScaleLabels[scale]}
            </button>
          {/each}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t(settings.locale, 'settings.language')}</legend>
        <div class="segment two">
          {#each localeOptions as option}
            <button
              type="button"
              class:active={settings.locale === option.locale}
              aria-label={option.label}
              aria-pressed={settings.locale === option.locale}
              title={option.label}
              onclick={() => settings.setLocale(option.locale)}
            >
              {localeCode(option.locale)}
            </button>
          {/each}
        </div>
      </fieldset>

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
    width: 44px;
    height: 44px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
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
    padding: 0.625rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    display: grid;
    gap: 0.625rem;
  }

  fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin: 0 0 0.35rem;
    padding: 0;
    display: grid;
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
    line-height: 1.2;
  }

  .segment {
    display: grid;
    gap: 1px;
    border: 1px solid var(--color-border);
    background: var(--color-border);
  }

  .segment.two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .segment.four {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .segment button,
  .logout {
    min-height: 44px;
    border: 0;
    background: var(--color-bg);
    color: var(--color-fg);
    font: inherit;
    font-size: var(--text-xs);
    font-weight: 700;
    cursor: pointer;
  }

  .segment button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    letter-spacing: 0.02em;
  }

  .icon-choice :global(.pixel) {
    color: currentColor;
  }

  .segment button:hover {
    color: var(--color-yellow-500);
  }

  .segment button:focus-visible,
  .logout:focus-visible,
  .trigger:focus-visible {
    outline: 2px solid var(--color-yellow-500);
    outline-offset: 2px;
  }

  .segment button.active {
    background: color-mix(in oklch, var(--color-yellow-500) 12%, var(--color-bg));
    color: var(--color-yellow-500);
  }

  .logout {
    border: 1px solid var(--color-border);
    cursor: pointer;
  }

  @media (max-width: 520px) {
    .segment.four {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
