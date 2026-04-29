import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('picker mode flow', () => {
  let stub: Awaited<ReturnType<typeof startStubHoncho>>;
  let dashboard: Awaited<ReturnType<typeof startDashboard>>;

  test.beforeAll(async () => {
    stub = await startStubHoncho();
    dashboard = await startDashboard({
      apiBase: stub.url,
      workspaceId: null,
    });
  });

  test.afterAll(async () => {
    await dashboard?.stop();
    await stub?.stop();
  });

  test('redirects root to /workspaces, picker -> peer -> session drill-down', async ({ page }) => {
    await page.goto(dashboard.url);

    await expect(page).toHaveURL(/\/workspaces$/);

    await expect(page.getByText('alpha', { exact: true })).toBeVisible();
    await expect(page.getByText('beta', { exact: true })).toBeVisible();

    await page.getByText('alpha', { exact: true }).click();
    await expect(page).toHaveURL(/\/workspaces\/ws-alpha$/);

    await expect(page.getByText('hermes')).toBeVisible();
    await page.getByText('hermes').click();
    await expect(page).toHaveURL(/\/workspaces\/ws-alpha\/peers\/peer-1$/);

    await expect(page.getByText('sess-1')).toBeVisible();
  });

  test('deep URL boots straight to peer view', async ({ page }) => {
    await page.goto(`${dashboard.url}/workspaces/ws-alpha/peers/peer-1`);
    await expect(page).toHaveURL(/\/workspaces\/ws-alpha\/peers\/peer-1$/);
    await expect(page.getByText('sess-1')).toBeVisible();
  });

  test('stale pinned URL redirects to /workspaces in picker mode', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers`);
    await expect(page).toHaveURL(/\/workspaces$/);
  });
});
