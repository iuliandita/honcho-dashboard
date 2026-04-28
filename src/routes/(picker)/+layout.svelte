<script lang="ts">
import Icon from '$ui/pixel/Icon.svelte';
import type { Snippet } from 'svelte';

interface Props {
  children: Snippet;
}

const { children }: Props = $props();
</script>

<section class="picker-mode">
  <p class="banner">
    <Icon name="dot" size={10} />
    <span class="label">picker</span>
    <span class="sep" aria-hidden="true">·</span>
    <span>no workspace pinned</span>
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
