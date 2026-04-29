import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import packageJson from '../../package.json';
import type { AuthConfig } from './auth/config';
import { readAuthConfig } from './auth/config';
import { authMiddleware } from './auth/middleware';
import { authRoute } from './auth/route';
import type { AppBindings } from './bindings';
import { healthRoute } from './health';
import { proxyRoute } from './proxy';
import { runtimeConfigRoute } from './runtime-config';
import { staticRoute } from './static';

const VERSION = packageJson.version;
function contentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
} as const;

export interface AppConfig {
  apiBase: string;
  adminToken: string;
  workspaceId: string | null;
  version: string;
  timeoutMs: number;
  buildDir: string;
  authConfig: AuthConfig;
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

function parseIntegerInRange(name: string, rawValue: string, min: number, max: number): number {
  if (!/^\d+$/.test(rawValue)) {
    throw new Error(`${name} must be an integer`);
  }

  const value = Number.parseInt(rawValue, 10);
  if (value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }

  return value;
}

function validateApiBase(name: string, value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an http(s) URL`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} must be an http(s) URL`);
  }

  return value;
}

function validateTimeoutMs(value: number): number {
  if (!Number.isInteger(value) || value < 1000 || value > 300_000) {
    throw new Error('timeoutMs must be an integer between 1000 and 300000');
  }
  return value;
}

export function readListenPort(): number {
  return parseIntegerInRange('PORT', process.env.PORT ?? '3000', 1, 65_535);
}

function assertProductionBuildDir(buildDir: string): void {
  if (process.env.NODE_ENV === 'production' && !existsSync(buildDir)) {
    throw new Error(`BUILD_DIR does not exist: ${buildDir}`);
  }
}

export function createApp(overrides?: Partial<AppConfig>): Hono<AppBindings> {
  // Required fields: only consult env when overrides don't supply them, so tests passing full
  // overrides don't need env vars set.
  const apiBase = validateApiBase(
    overrides?.apiBase === undefined ? 'HONCHO_API_BASE' : 'apiBase',
    overrides?.apiBase ?? readEnvRequired('HONCHO_API_BASE'),
  );
  const adminToken = overrides?.adminToken ?? readEnvRequired('HONCHO_ADMIN_TOKEN');
  const timeoutMs =
    overrides?.timeoutMs ??
    parseIntegerInRange('HONCHO_PROXY_TIMEOUT', readEnvOptional('HONCHO_PROXY_TIMEOUT') ?? '15', 1, 300) * 1000;
  const buildDir = resolve(overrides?.buildDir ?? process.env.BUILD_DIR ?? './build');
  assertProductionBuildDir(buildDir);

  const config: AppConfig = {
    workspaceId: overrides?.workspaceId ?? readEnvOptional('HONCHO_WORKSPACE_ID'),
    version: overrides?.version ?? readEnvOptional('HONCHO_DASHBOARD_VERSION') ?? VERSION,
    timeoutMs: validateTimeoutMs(timeoutMs),
    buildDir,
    authConfig: overrides?.authConfig ?? readAuthConfig(),
    apiBase,
    adminToken,
    fetch: overrides?.fetch,
  };

  const app = new Hono<AppBindings>();

  app.use('*', async (c, next) => {
    const scriptNonce = randomBytes(16).toString('base64url');
    c.set('scriptNonce', scriptNonce);
    await next();
    c.header('Content-Security-Policy', contentSecurityPolicy(scriptNonce));
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      c.header(name, value);
    }
  });

  if (process.env.LOG_LEVEL !== 'silent') {
    app.use('*', logger());
  }

  app.route('/', healthRoute);
  app.route('/', authRoute(config.authConfig));
  // Keep runtime config before the /api/* proxy so the dashboard's own bootstrap endpoint is never forwarded.
  app.route('/', runtimeConfigRoute({ workspaceId: config.workspaceId, version: config.version }));
  app.use('/api/v3/*', authMiddleware(config.authConfig));
  app.route(
    '/',
    proxyRoute({
      apiBase: config.apiBase,
      adminToken: config.adminToken,
      timeoutMs: config.timeoutMs,
      fetch: config.fetch,
    }),
  );
  app.route('/', staticRoute({ buildDir: config.buildDir }));

  return app;
}

// Entry point when run directly via `bun run dist/index.js`.
if (import.meta.main) {
  const app = createApp();
  const port = readListenPort();
  Bun.serve({ port, fetch: app.fetch });
  console.warn(`honcho-dashboard listening on :${port}`);
}
