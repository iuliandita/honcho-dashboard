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

<p class="redirecting">redirecting…</p>

<style>
  .redirecting {
    color: var(--color-fg-faint);
    text-align: center;
    margin-top: 4rem;
  }
</style>
