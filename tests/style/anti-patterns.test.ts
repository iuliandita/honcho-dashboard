import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = join(process.cwd(), 'src');
const sourceExtensions = new Set(['.css', '.svelte']);
const sideStripePattern = /border-(left|right)\s*:\s*(\d+(?:\.\d+)?)px/g;
const emDashPattern = /—/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (![...sourceExtensions].some((extension) => entry.name.endsWith(extension))) return [];
    return [path];
  });
}

describe('design anti-pattern guardrails', () => {
  it('does not use thick side-stripe borders as accents', () => {
    const violations = sourceFiles(sourceRoot).flatMap((path) => {
      const content = readFileSync(path, 'utf8');
      return [...content.matchAll(sideStripePattern)]
        .filter((match) => Number(match[2]) > 1)
        .map((match) => `${relative(process.cwd(), path)}: ${match[0]}`);
    });

    expect(violations).toEqual([]);
  });

  it('does not use em dashes in UI source copy', () => {
    const violations = sourceFiles(sourceRoot).flatMap((path) => {
      const content = readFileSync(path, 'utf8');
      return [...content.matchAll(emDashPattern)].map((match) => `${relative(process.cwd(), path)}:${match.index}`);
    });

    expect(violations).toEqual([]);
  });
});
