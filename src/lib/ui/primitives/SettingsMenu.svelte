<script lang="ts">
import { type MessageKey, localeOptions, t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import { FONT_SCALES, THEMES } from '$lib/settings/preferences';
import Icon from '$ui/pixel/Icon.svelte';

interface Props {
  settings: AppSettings;
  authEnabled: boolean;
  onLogout?: () => void | Promise<void>;
}

const { settings, authEnabled, onLogout }: Props = $props();
// biome-ignore lint/style/useConst: button handlers reassign this Svelte rune state from markup.
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
        <select value={settings.theme} onchange={(event) => settings.setTheme(event.currentTarget.value as never)}>
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
