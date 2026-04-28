import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // svelteTesting() rewires the resolve conditions so jsdom-based component tests
  // get the browser build of Svelte (mount/unmount), not the SSR shim.
  plugins: [sveltekit(), svelteTesting()],
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/api/**/*.ts',
        'src/lib/features/**/*.ts',
        'src/lib/runtime-config/**/*.ts',
        'src/server/**/*.ts',
      ],
      exclude: ['**/*.test.ts', 'src/lib/honcho/**'],
      thresholds: {
        lines: 80,
        branches: 70,
      },
    },
    // Component tests (anything touching DOM/Svelte mount) need jsdom.
    // Pure logic tests stay on `node` for speed.
    environmentMatchGlobs: [
      ['src/lib/**/*.test.ts', 'jsdom'],
      ['**/*', 'node'],
    ],
    globals: false,
  },
});
