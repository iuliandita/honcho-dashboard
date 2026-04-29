import { Hono } from 'hono';

export interface RuntimeConfig {
  /**
   * `null` means picker mode: HONCHO_WORKSPACE_ID is unset and the UI renders a workspace picker.
   * A string means pinned mode: the UI skips the picker and goes straight to that workspace.
   * Both are valid; see README "Workspace modes".
   */
  workspaceId: string | null;
  version: string;
}

export function runtimeConfigRoute(config: RuntimeConfig) {
  // Client boot contract: keep this shape stable unless `fetchRuntimeConfig` is versioned with it.
  return new Hono().get('/api/runtime-config', (c) => c.json(config));
}
