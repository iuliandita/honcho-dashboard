import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

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
 */
export function staticRoute(config: StaticConfig) {
  return new Hono()
    .use(
      '/_app/*',
      serveStatic({
        root: config.buildDir,
        rewriteRequestPath: (path) => path,
        onFound: (_path, c) => {
          c.header('Cache-Control', 'public, max-age=31536000, immutable');
        },
      }),
    )
    .use(
      '*',
      serveStatic({
        root: config.buildDir,
        rewriteRequestPath: (path) => path,
        onFound: (_path, c) => {
          c.header('Cache-Control', 'no-cache');
        },
      }),
    )
    // SPA fallback — any request that didn't match a file falls through to index.html.
    .get('*', async (c) => {
      const file = Bun.file(`${config.buildDir}/index.html`);
      const exists = await file.exists();
      if (!exists) {
        return c.text('Build not found. Run `bun run build`.', 500);
      }
      c.header('Cache-Control', 'no-cache');
      c.header('Content-Type', 'text/html; charset=utf-8');
      return c.body(await file.arrayBuffer());
    });
}
