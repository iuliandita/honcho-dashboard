<script lang="ts">
import { invalidateAll } from '$app/navigation';
import type { AppSettings } from '$lib/settings/AppSettings.svelte';
import type { Snippet } from 'svelte';
import LoginScreen from './LoginScreen.svelte';
import { fetchAuthStatus, login, logout } from './api';

export interface AuthControls {
  enabled: boolean;
  logout: () => Promise<void>;
}

interface Props {
  settings: AppSettings;
  children: Snippet<[AuthControls]>;
}

const { settings, children }: Props = $props();
let enabled = $state(false);
let authenticated = $state(false);
let loading = $state(true);

async function refresh() {
  const status = await fetchAuthStatus();
  enabled = status.enabled;
  authenticated = status.authenticated;
  loading = false;
}

async function submit(password: string) {
  await login(password);
  authenticated = true;
  await invalidateAll();
}

export async function signOut() {
  await logout();
  authenticated = false;
}

$effect(() => {
  void refresh();
});
</script>

{#if loading}
  <main class="auth-loading">loading</main>
{:else if enabled && !authenticated}
  <LoginScreen {settings} onSubmit={submit} />
{:else}
  {@render children({ enabled, logout: signOut })}
{/if}

<style>
  .auth-loading {
    display: grid;
    min-height: 100dvh;
    place-items: center;
    color: var(--color-fg-muted);
  }
</style>
