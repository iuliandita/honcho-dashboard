import { parseErrorBody } from '$api/errors';

export interface RuntimeConfig {
  workspaceId: string | null;
  version: string;
}

export type WorkspaceMode = 'pinned' | 'picker';

export type RuntimeConfigFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface FetchRuntimeConfigOptions {
  fetch?: RuntimeConfigFetch;
}

export async function fetchRuntimeConfig(options: FetchRuntimeConfigOptions = {}): Promise<RuntimeConfig> {
  const fetcher: RuntimeConfigFetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const res = await fetcher('/api/runtime-config');
  if (!res.ok) {
    throw await parseErrorBody(res);
  }
  return (await res.json()) as RuntimeConfig;
}

export function workspaceMode(config: RuntimeConfig): WorkspaceMode {
  return config.workspaceId === null ? 'picker' : 'pinned';
}
