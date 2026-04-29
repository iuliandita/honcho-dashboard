import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('touch targets', () => {
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

  const routes = ['/peers', '/peers/peer-1', '/peers/peer-1/representation', '/peers/peer-1/chat', '/search'];

  for (const route of routes) {
    test(`keeps primary controls at least 44px on touch screens: ${route}`, async ({ browser }) => {
      const context = await browser.newContext({
        hasTouch: true,
        isMobile: true,
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();

      await page.goto(`${dashboard.url}${route}`);
      await page.waitForLoadState('networkidle');

      const undersized = await page
        .locator('.theme-toggle, .search-link, .tab, .chip, .input, .send, .cancel')
        .evaluateAll((elements) =>
          elements
            .map((element) => {
              const rect = element.getBoundingClientRect();
              const label =
                element.getAttribute('aria-label') ||
                element.textContent?.trim().replace(/\s+/g, ' ') ||
                element.getAttribute('placeholder') ||
                element.className;
              return { label, width: Math.round(rect.width), height: Math.round(rect.height) };
            })
            .filter((target) => target.width > 0 && target.height > 0)
            .filter((target) => target.width < 44 || target.height < 44),
        );

      await context.close();

      expect(undersized).toEqual([]);
    });
  }

  test('keeps mobile chrome compact while preserving theme button label for assistive tech', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    await page.goto(`${dashboard.url}/peers/peer-1/chat`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'switch to light theme' })).toBeVisible();
    const labelBox = await page.locator('.theme-label').boundingBox();
    expect(labelBox?.width).toBeLessThanOrEqual(1);
    expect(labelBox?.height).toBeLessThanOrEqual(1);

    await context.close();
  });
});
