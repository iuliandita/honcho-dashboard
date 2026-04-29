<script lang="ts">
import PeerChrome from '$lib/route-shared/PeerChrome.svelte';
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';

interface Props {
  data: LayoutData;
  children: Snippet;
}

const { data, children }: Props = $props();
</script>

<PeerChrome peerId={data.peerId}>
  {@render children()}
</PeerChrome>
