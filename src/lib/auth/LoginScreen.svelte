<script lang="ts">
import { localeOptions, t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import BrandMark from '$ui/ascii/BrandMark.svelte';

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
  <form
    class="panel"
    onsubmit={(event) => {
      event.preventDefault();
      void submit();
    }}
  >
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

<style>
  .login {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 1rem;
    box-sizing: border-box;
    background: var(--color-bg);
  }

  .panel {
    width: min(24rem, 100%);
    display: grid;
    gap: 1rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .panel :global(.font-ascii) {
    color: var(--color-yellow-500);
  }

  p {
    margin: 0;
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
  }

  label {
    display: grid;
    gap: 0.35rem;
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
  }

  input,
  select,
  button {
    min-height: 44px;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-fg);
    font: inherit;
  }

  input,
  select {
    padding: 0 0.65rem;
  }

  button {
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    border-color: var(--color-yellow-500);
    color: var(--color-yellow-500);
  }

  button:disabled {
    cursor: not-allowed;
    color: var(--color-fg-faint);
  }

  .error {
    color: var(--color-error);
  }
</style>
