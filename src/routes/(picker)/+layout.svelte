<script lang="ts">
import { t } from '$lib/i18n';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import Icon from '$ui/pixel/Icon.svelte';
import { type Snippet, getContext } from 'svelte';

interface Props {
  children: Snippet;
}

const { children }: Props = $props();
const settings = getContext<AppSettings>('app-settings');
</script>

<section class="picker-mode">
  <p class="banner">
    <Icon name="dot" size={10} />
    <span class="label">{t(settings.locale, 'mode.picker')}</span>
    <span class="sep" aria-hidden="true">·</span>
    <span>{t(settings.locale, 'mode.picker.description')}</span>
  </p>
  {@render children()}
</section>

<style>
  .picker-mode {
    display: contents;
  }

  .banner {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
    margin: 0 0 1rem 0;
  }

  .banner :global(.pixel) {
    color: var(--color-warn);
  }

  .label {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-fg-faint);
  }

  .sep {
    color: var(--color-border);
  }
</style>
