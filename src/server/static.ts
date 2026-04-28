import { Hono } from 'hono';

export interface StaticConfig {
  /** Path to the SvelteKit build output (typically `./build`). */
  buildDir: string;
}

/**
 * Serves the SvelteKit adapter-static build using Bun.file directly.
 *
 * Why not `hono/bun`'s `serveStatic`? Two reasons:
 *  - It references the global `Bun` at module load, which crashes vitest under Node.
 *  - It's a thin wrapper over Bun.file anyway; we control the headers we want.
 *
 * Behaviour:
 *  - Hashed assets under `/_app/...` get `Cache-Control: public, max-age=31536000, immutable`.
 *  - Other matched files get `Cache-Control: no-cache` so config-injected pages update fast.
 *  - Unmatched paths fall back to `index.html` (SPA mode).
 *  - Path traversal (`..`, NUL, control bytes) returns 404 without touching the filesystem.
 */
export function staticRoute(config: StaticConfig) {
  return new Hono().get('*', async (c) => {
    let requested: string;
    try {
      requested = decodeURIComponent(c.req.path);
    } catch {
      return c.notFound();
    }

    // Refuse anything that looks like an attempt to escape buildDir or smuggle control bytes.
    // biome-ignore lint/suspicious/noControlCharactersInRegex: deliberately rejecting C0 control chars in path.
    if (requested.includes('..') || /[\x00-\x1f]/.test(requested)) {
      return c.notFound();
    }

    const tryPath = requested === '/' ? '/index.html' : requested;
    const file = Bun.file(`${config.buildDir}${tryPath}`);

    if (await file.exists()) {
      const cacheControl = tryPath.startsWith('/_app/') ? 'public, max-age=31536000, immutable' : 'no-cache';
      const headers = new Headers({ 'Cache-Control': cacheControl });
      if (file.type) headers.set('Content-Type', file.type);
      return new Response(file, { headers });
    }

    // SPA fallback — any unmatched path serves index.html so the client router takes over.
    const index = Bun.file(`${config.buildDir}/index.html`);
    if (await index.exists()) {
      return new Response(index, {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return c.text('Build not found. Run `bun run build`.', 500);
  });
}
