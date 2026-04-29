import { describe, expect, it } from 'vitest';
import packageJson from '../package.json';

describe('package scripts', () => {
  it('starts both the BFF and Vite in development', () => {
    expect(packageJson.scripts.dev).toBe('bun run scripts/dev.ts');
  });

  it('syncs SvelteKit before production builds', () => {
    expect(packageJson.scripts.build).toBe(
      'svelte-kit sync && vite build && bun build src/server/index.ts --target=bun --outdir=dist --minify',
    );
  });
});
