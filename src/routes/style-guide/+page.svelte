<script lang="ts">
import PixelIcon, { type IconName } from '$ui/pixel/PixelIcon.svelte';
import { onMount } from 'svelte';

const colorTokens = [
  'color-yellow-50',
  'color-yellow-100',
  'color-yellow-200',
  'color-yellow-300',
  'color-yellow-400',
  'color-yellow-500',
  'color-yellow-600',
  'color-yellow-700',
  'color-yellow-800',
  'color-yellow-900',
  'color-bg',
  'color-surface',
  'color-surface-2',
  'color-border',
  'color-fg',
  'color-fg-muted',
  'color-fg-faint',
  'color-error',
  'color-warn',
  'color-ok',
];

const textTokens = ['text-2xs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
const iconNames = [
  'topic',
  'memory',
  'profile',
  'chat',
  'search',
  'session',
  'peer',
  'workspace',
] as const satisfies readonly IconName[];

let resolved = $state<Record<string, string>>({});

onMount(() => {
  const style = getComputedStyle(document.documentElement);
  const next: Record<string, string> = {};
  for (const token of [...colorTokens, ...textTokens]) {
    next[token] = style.getPropertyValue(`--${token}`).trim();
  }
  next['font-mono'] = style.getPropertyValue('--font-mono').trim();
  resolved = next;
});
</script>

<article class="guide">
  <header>
    <h1>style guide</h1>
    <p class="subtitle">live token gallery; values resolve from rendered CSS custom properties.</p>
  </header>

  <section>
    <h2>color</h2>
    <div class="swatches">
      {#each colorTokens as token (token)}
        <div class="swatch">
          <div class="chip" style:background={`var(--${token})`}></div>
          <span class="name"><code>--{token}</code></span>
          <span class="value"><code>{resolved[token] ?? '...'}</code></span>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h2>typography</h2>
    <p class="font-spec">
      <code>{resolved['font-mono'] ?? '...'}</code>
    </p>
    <table class="type-scale">
      <thead>
        <tr><th>token</th><th>value</th><th>preview</th></tr>
      </thead>
      <tbody>
        {#each textTokens as token (token)}
          <tr>
            <td><code>--{token}</code></td>
            <td><code>{resolved[token] ?? '...'}</code></td>
            <td><span style:font-size={`var(--${token})`}>The quick brown fox 0123456789</span></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <p class="tabular-demo">
      tabular numerals: <span class="tnum">1234567890</span>
    </p>
  </section>

  <section>
    <h2>pixel icons</h2>
    <div class="icons">
      {#each iconNames as name}
        <div class="icon-cell">
          <span class="big"><PixelIcon {name} size={32} /></span>
          <span class="med"><PixelIcon {name} size={16} /></span>
          <span class="sm"><PixelIcon {name} size={12} /></span>
          <code>{name}</code>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h2>states</h2>
    <div class="state-row">
      <span class="state ok">ok</span>
      <span class="state warn">warn</span>
      <span class="state error">error</span>
    </div>
  </section>
</article>

<style>
  .guide {
    padding: 1.5rem;
    max-width: 80rem;
  }
  header h1 {
    margin: 0;
    color: var(--color-yellow-500);
    font-size: var(--text-2xl);
  }
  .subtitle {
    color: var(--color-fg-muted);
    margin: 0.25rem 0 1.5rem 0;
  }
  section {
    margin-bottom: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }
  h2 {
    color: var(--color-yellow-500);
    font-size: var(--text-lg);
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 0.5rem;
  }
  .swatch {
    display: grid;
    grid-template-columns: 2rem 1fr;
    grid-template-rows: auto auto;
    gap: 0.25rem 0.75rem;
    align-items: center;
    padding: 0.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }
  .chip {
    grid-row: 1 / 3;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--color-border);
  }
  .name code {
    font-size: var(--text-sm);
    color: var(--color-fg);
  }
  .value code {
    font-size: var(--text-xs);
    color: var(--color-fg-faint);
  }
  .font-spec {
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
    margin-bottom: 1rem;
  }
  .type-scale {
    width: 100%;
    border-collapse: collapse;
  }
  .type-scale th,
  .type-scale td {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
    font-variant-numeric: tabular-nums;
  }
  .type-scale th {
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
    text-transform: uppercase;
  }
  .tabular-demo {
    margin-top: 1rem;
    color: var(--color-fg-muted);
    font-size: var(--text-sm);
  }
  .tnum {
    color: var(--color-yellow-500);
  }
  .icons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: 1rem;
  }
  .icon-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-yellow-500);
  }
  .icon-cell code {
    color: var(--color-fg-muted);
    font-size: var(--text-xs);
  }
  .state-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .state {
    padding: 0.25rem 0.6rem;
    border: 1px solid currentColor;
    font-size: var(--text-sm);
    text-transform: uppercase;
  }
  .state.ok {
    color: var(--color-ok);
  }
  .state.warn {
    color: var(--color-warn);
  }
  .state.error {
    color: var(--color-error);
  }

  @media (max-width: 640px) {
    .guide {
      padding: 1rem 0;
    }
    .swatches {
      grid-template-columns: 1fr;
    }
    .type-scale {
      display: block;
      overflow-x: auto;
    }
  }
</style>
