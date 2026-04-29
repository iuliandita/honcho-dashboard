<script lang="ts">
import { formatAbsolute, formatRelative } from '$features/messages/format';
import { t } from '$lib/i18n';
import { getLocaleContext } from '$lib/settings/context';
import EmptyProfile from '$ui/ascii/EmptyProfile.svelte';
import EmptyState from '$ui/primitives/EmptyState.svelte';
import type { ProfileResponse } from './api';
import { renderMarkdown } from './markdown';

interface Props {
  profile: ProfileResponse;
}

const { profile }: Props = $props();
const settings = getLocaleContext();
const html = $derived(renderMarkdown(profile.markdown));
const trimmed = $derived(profile.markdown.trim());
</script>

{#if !trimmed}
  <EmptyState title={t(settings.locale, 'profile.emptyYet')} description={t(settings.locale, 'profile.empty.description')}>
    {#snippet art()}<EmptyProfile />{/snippet}
  </EmptyState>
{:else}
  <article class="profile">
    {#if profile.updatedAt}
      <p class="meta">
        {t(settings.locale, 'profile.updated')} <span title={profile.updatedAt}>{formatRelative(profile.updatedAt)}</span>
        / <span class="abs">{formatAbsolute(profile.updatedAt)}</span>
      </p>
    {/if}
    <!-- biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown sanitizes with DOMPurify allowlists. -->
    <div class="md">{@html html}</div>
  </article>
{/if}

<style>
  .profile {
    max-width: 80ch;
    padding: 1rem 1.5rem;
  }
  .meta {
    margin: 0 0 1rem;
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }
  .abs {
    color: var(--color-fg-faint);
  }
  .md :global(h1),
  .md :global(h2),
  .md :global(h3),
  .md :global(h4),
  .md :global(h5),
  .md :global(h6) {
    margin: 1.25rem 0 0.5rem;
    color: var(--color-yellow-500);
    font-weight: 700;
  }
  .md :global(h1) {
    font-size: var(--text-2xl);
  }
  .md :global(h2) {
    font-size: var(--text-xl);
  }
  .md :global(h3) {
    font-size: var(--text-lg);
  }
  .md :global(p) {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
  .md :global(ul),
  .md :global(ol) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  .md :global(li) {
    margin: 0.25rem 0;
  }
  .md :global(strong) {
    color: var(--color-fg);
    font-weight: 700;
  }
  .md :global(em) {
    color: var(--color-fg);
    font-style: italic;
  }
  .md :global(blockquote) {
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    background: color-mix(in oklab, var(--color-yellow-500) 6%, transparent);
    color: var(--color-fg-muted);
  }
  .md :global(code) {
    padding: 0.1rem 0.3rem;
    border-radius: 2px;
    background: var(--color-surface);
    color: var(--color-yellow-500);
    font-size: var(--text-sm);
  }
  .md :global(pre) {
    margin: 0.75rem 0;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    overflow-x: auto;
  }
  .md :global(pre code) {
    padding: 0;
    background: transparent;
    color: var(--color-fg);
  }
  .md :global(a) {
    color: var(--color-yellow-500);
  }
</style>
