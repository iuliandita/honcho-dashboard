import { Hono } from 'hono';

export interface RuntimeConfig {
  workspaceId: string | null;
  version: string;
}

export function runtimeConfigRoute(config: RuntimeConfig) {
  return new Hono().get('/api/runtime-config', (c) => c.json(config));
}
