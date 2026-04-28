import { Hono } from 'hono';

export interface RuntimeConfig {
  workspaceId: string | null;
  version: string;
}

export function runtimeConfigRoute(config: RuntimeConfig) {
  // Client boot contract: keep this shape stable unless `fetchRuntimeConfig` is versioned with it.
  return new Hono().get('/api/runtime-config', (c) => c.json(config));
}
