<script lang="ts">
import { goto } from '$app/navigation';
import { workspaceMode } from '$lib/runtime-config';
import type { PageData } from './$types';

interface Props {
  data: PageData;
}

const { data }: Props = $props();

$effect(() => {
  const mode = workspaceMode(data.runtimeConfig);
  const target = mode === 'pinned' ? '/peers' : '/workspaces';
  goto(target, { replaceState: true });
});
</script>

<div class="redirecting">
  <p>
    <span class="prompt" aria-hidden="true">$</span>
    routing
    <span class="cursor" aria-hidden="true">█</span>
  </p>
</div>

<style>
  .redirecting {
    margin: 6rem auto;
    text-align: center;
    color: var(--color-fg-faint);
    font-size: var(--text-sm);
  }

  .prompt {
    color: var(--color-yellow-500);
    margin-right: 0.4rem;
  }

  .cursor {
    color: var(--color-yellow-500);
    animation: var(--animate-cursor-blink);
    margin-left: 0.2rem;
  }
</style>
