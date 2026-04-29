import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('settings preferences', () => {
  let stub: Awaited<ReturnType<typeof startStubHoncho>>;
  let dashboard: Awaited<ReturnType<typeof startDashboard>>;

  test.beforeAll(async () => {
    stub = await startStubHoncho();
    dashboard = await startDashboard({ apiBase: stub.url, workspaceId: 'ws-alpha' });
  });

  test.afterAll(async () => {
    await dashboard?.stop();
    await stub?.stop();
  });

  test('applies stored extra-large font scale before rendering', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('fontScale', 'extra-large'));
    await page.goto(`${dashboard.url}/peers`);
    await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'extra-large');
    const size = await page.locator('body').evaluate((node) => getComputedStyle(node).fontSize);
    expect(Number.parseFloat(size)).toBeGreaterThan(14);
  });

  test('uses saved German locale over an English browser preference', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'languages', { value: ['en-US'] });
      localStorage.setItem('locale', 'de');
    });
    await page.goto(`${dashboard.url}/peers`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('persists German locale in the running app', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('locale', 'de'));
    await page.goto(`${dashboard.url}/peers`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.getByRole('link', { name: 'Suche' })).toBeVisible();
  });
});
