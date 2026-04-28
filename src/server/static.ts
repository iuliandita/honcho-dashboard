import { Hono } from 'hono';

export interface StaticConfig {
  /** Path to the SvelteKit build output (typically `./build`). */
  buildDir: string;
}

/**
 * Serves the SvelteKit adapter-static build.
 *
 * - `/` and unknown routes fall back to `index.html` (SPA mode).
 * - Hashed assets (everything under `/_app/`) get long-lived immutable cache.
 * - `index.html` is no-cache so config injection / version updates land immediately.
 *
 * Bun-specific deps (`hono/bun`, global `Bun`) are loaded lazily inside the handler so the module
 * can be imported in non-Bun runtimes (vitest under Node) without crashing at module load.
 */
export function staticRoute(config: StaticConfig) {
  const app = new Hono();

  // Lazy-mount the Bun-backed serveStatic on first matching request.
  let bunRoutesMounted = false;
  async function mountBunRoutes() {
    if (bunRoutesMounted) return;
    bunRoutesMounted = true;
    const { serveStatic } = await import('hono/bun');
    app.use(
      '/_app/*',
      serveStatic({
        root: config.buildDir,
        rewriteRequestPath: (path) => path,
        onFound: (_path, c) => {
          c.header('Cache-Control', 'public, max-age=31536000, immutable');
        },
      }),
    );
    app.use(
      '*',
      serveStatic({
        root: config.buildDir,
        rewriteRequestPath: (path) => path,
        onFound: (_path, c) => {
          c.header('Cache-Control', 'no-cache');
        },
      }),
    );
  }

  app.use('*', async (c, next) => {
    await mountBunRoutes();
    await next();
  });

  // SPA fallback — any request that didn't match a file falls through to index.html.
  app.get('*', async (c) => {
    const file = Bun.file(`${config.buildDir}/index.html`);
    const exists = await file.exists();
    if (!exists) {
      return c.text('Build not found. Run `bun run build`.', 500);
    }
    c.header('Cache-Control', 'no-cache');
    c.header('Content-Type', 'text/html; charset=utf-8');
    return c.body(await file.arrayBuffer());
  });

  return app;
}
