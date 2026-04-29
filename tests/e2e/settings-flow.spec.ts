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

  test('exposes a visible font size control in settings', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers`);

    const settingsButton = page.getByRole('button', { name: 'settings' });
    await expect(settingsButton).toHaveText('');
    await expect(settingsButton).toHaveAttribute('title', 'settings');
    await settingsButton.click();

    await expect(page.getByRole('group', { name: 'theme' }).getByRole('button', { name: 'dark' })).toHaveText('');
    await expect(page.getByRole('group', { name: 'theme' }).getByRole('button', { name: 'light' })).toHaveText('');
    await expect(page.getByRole('group', { name: 'font size' }).getByRole('button')).toHaveText(['S', 'N', 'L', 'XL']);
    await expect(page.getByRole('group', { name: 'language' }).getByRole('button')).toHaveText(['EN', 'DE']);

    await page.getByRole('group', { name: 'font size' }).getByRole('button', { name: 'extra large' }).click();

    await expect(page.locator('html')).toHaveAttribute('data-font-scale', 'extra-large');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('fontScale'))).toBe('extra-large');
  });

  test('keeps chrome controls aligned with the main content on wide screens', async ({ page }) => {
    await page.setViewportSize({ width: 2048, height: 900 });
    await page.goto(`${dashboard.url}/peers`);

    const brand = page.getByRole('link', { name: 'honcho-dashboard' });
    await expect(brand).toHaveAttribute('href', '/');

    const brandBox = await brand.boundingBox();
    const settingsBox = await page.getByRole('button', { name: 'settings' }).boundingBox();
    const mainMetrics = await page.locator('main').evaluate((node) => {
      const box = node.getBoundingClientRect();
      const styles = getComputedStyle(node);
      const paddingLeft = Number.parseFloat(styles.paddingLeft);
      const paddingRight = Number.parseFloat(styles.paddingRight);
      return {
        contentLeft: box.left + paddingLeft,
        contentRight: box.right - paddingRight,
      };
    });

    expect(brandBox).not.toBeNull();
    expect(settingsBox).not.toBeNull();
    expect(Math.abs((brandBox?.x ?? 0) - mainMetrics.contentLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs((settingsBox?.x ?? 0) + (settingsBox?.width ?? 0) - mainMetrics.contentRight)).toBeLessThanOrEqual(
      1,
    );
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
