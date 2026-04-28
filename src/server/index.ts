import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { healthRoute } from './health';
import { proxyRoute } from './proxy';
import { runtimeConfigRoute } from './runtime-config';
import { staticRoute } from './static';

const VERSION = '0.1.0';

export interface AppConfig {
  apiBase: string;
  adminToken: string;
  workspaceId: string | null;
  version: string;
  timeoutMs: number;
  buildDir: string;
  /** Test-only fetch injection. */
  fetch?: (input: Request) => Response | Promise<Response>;
}

function readEnvRequired(name: string): string {
  const value = process.env[name];
  if (value && value.length > 0) return value;
  throw new Error(`Missing required env var: ${name}`);
}

function readEnvOptional(name: string): string | null {
  const value = process.env[name];
  return value && value.length > 0 ? value : null;
}

export function createApp(overrides?: Partial<AppConfig>): Hono {
  // Required fields: only consult env when overrides don't supply them, so tests passing full
  // overrides don't need env vars set.
  const apiBase = overrides?.apiBase ?? readEnvRequired('HONCHO_API_BASE');
  const adminToken = overrides?.adminToken ?? readEnvRequired('HONCHO_ADMIN_TOKEN');

  // Optional fields: env-driven defaults, then overridden by explicit `overrides` keys (incl. null).
  const optional = {
    workspaceId: readEnvOptional('HONCHO_WORKSPACE_ID'),
    version: VERSION,
    timeoutMs: Number.parseInt(readEnvOptional('HONCHO_PROXY_TIMEOUT') ?? '15', 10) * 1000,
    buildDir: process.env.BUILD_DIR ?? './build',
  };

  const config: AppConfig = {
    ...optional,
    apiBase,
    adminToken,
    ...overrides,
  };

  const app = new Hono();

  if (process.env.LOG_LEVEL !== 'silent') {
    app.use('*', logger());
  }

  app.route('/', healthRoute);
  app.route('/', runtimeConfigRoute({ workspaceId: config.workspaceId, version: config.version }));
  app.route('/', proxyRoute({
    apiBase: config.apiBase,
    adminToken: config.adminToken,
    timeoutMs: config.timeoutMs,
    fetch: config.fetch,
  }));
  app.route('/', staticRoute({ buildDir: config.buildDir }));

  return app;
}

// Entry point when run directly via `bun run dist/index.js`.
if (import.meta.main) {
  const app = createApp();
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  Bun.serve({ port, fetch: app.fetch });
  console.warn(`honcho-dashboard listening on :${port}`);
}
