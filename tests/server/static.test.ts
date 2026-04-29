import { Blob } from 'node:buffer';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppBindings } from '../../src/server/bindings';
import { staticRoute } from '../../src/server/static';

describe('staticRoute', () => {
  let buildDir: string;

  beforeEach(async () => {
    vi.stubGlobal('Bun', {
      file(path: string) {
        const exists = existsSync(path);
        const type = path.endsWith('.html') ? 'text/html;charset=utf-8' : 'text/javascript;charset=utf-8';
        const body = exists ? readFileSync(path) : '';
        return Object.assign(new Blob([body], { type }), {
          exists: async () => exists,
        });
      },
    });

    buildDir = await mkdtemp(join(tmpdir(), 'honcho-dashboard-static-'));
    await writeFile(join(buildDir, 'index.html'), '<div id="app"><script>bootstrap()</script></div>');
    await mkdir(join(buildDir, '_app'));
    await writeFile(join(buildDir, '_app', 'abc.js'), 'console.log("chunk");');
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await rm(buildDir, { recursive: true, force: true });
  });

  it('returns 404 for invalid percent-encoded paths', async () => {
    const app = staticRoute({ buildDir });

    const response = await app.request('/foo%');

    expect(response.status).toBe(404);
  });

  it('returns 404 for traversal attempts and control bytes', async () => {
    const app = staticRoute({ buildDir });

    const traversal = await app.request('/%2e%2e%2fsecret');
    const controlByte = await app.request('/%00secret');

    expect(traversal.status).toBe(404);
    expect(controlByte.status).toBe(404);
  });

  it('serves immutable cache headers for hashed app assets', async () => {
    const app = staticRoute({ buildDir });

    const response = await app.request('/_app/abc.js');

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(await response.text()).toBe('console.log("chunk");');
  });

  it('falls back to index.html for unmatched client routes', async () => {
    const app = staticRoute({ buildDir });

    const response = await app.request('/peers/peer-1/chat');

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(await response.text()).toBe('<div id="app"><script nonce="">bootstrap()</script></div>');
  });

  it('injects the CSP nonce into inline SvelteKit bootstrap scripts', async () => {
    const app = new Hono<AppBindings>();
    app.use('*', async (c, next) => {
      c.set('scriptNonce', 'test-nonce');
      await next();
    });
    app.route('/', staticRoute({ buildDir }));

    const response = await app.request('/');

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('<script nonce="test-nonce">bootstrap()</script>');
  });

  it('returns 500 when the build directory is missing', async () => {
    const app = staticRoute({ buildDir: join(buildDir, 'missing') });

    const response = await app.request('/anything');

    expect(response.status).toBe(500);
    expect(await response.text()).toContain('Build not found');
  });
});
