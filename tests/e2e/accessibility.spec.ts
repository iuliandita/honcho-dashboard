import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('accessibility', () => {
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

  const routes = [
    { path: '/peers', readyText: 'hermes' },
    { path: '/peers/peer-1', readyText: 'sess-1' },
    { path: '/peers/peer-1/sessions/sess-1', readyText: 'message body 0' },
    { path: '/peers/peer-1/representation', readyText: 'prefers oat milk' },
    { path: '/peers/peer-1/profile', readyText: 'prefers oat milk' },
    { path: '/peers/peer-1/chat', readyText: 'ask honcho about this peer' },
    { path: '/search', readyText: 'search' },
  ] as const;

  for (const route of routes) {
    test(`has no detectable axe violations on ${route.path}`, async ({ page }) => {
      await page.goto(`${dashboard.url}${route.path}`);
      await expect(page.getByText(route.readyText).first()).toBeVisible();

      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test(`has no detectable axe violations in light theme on ${route.path}`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('theme', 'light');
      });
      await page.goto(`${dashboard.url}${route.path}`);
      await expect(page.getByText(route.readyText).first()).toBeVisible();

      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
