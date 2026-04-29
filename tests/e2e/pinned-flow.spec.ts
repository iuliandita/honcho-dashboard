import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('pinned mode flow', () => {
  let stub: Awaited<ReturnType<typeof startStubHoncho>>;
  let dashboard: Awaited<ReturnType<typeof startDashboard>>;

  test.beforeAll(async () => {
    stub = await startStubHoncho();
    dashboard = await startDashboard({
      apiBase: stub.url,
      workspaceId: 'ws-alpha',
    });
  });

  test.afterAll(async () => {
    await dashboard?.stop();
    await stub?.stop();
  });

  test('redirects root to /peers, drills to a session', async ({ page }) => {
    await page.goto(dashboard.url);

    await expect(page).toHaveURL(/\/peers$/);

    await expect(page.getByText('hermes')).toBeVisible();
    await expect(page.getByText('iris')).toBeVisible();

    await page.getByText('hermes').click();
    await expect(page).toHaveURL(/\/peers\/peer-1$/);

    await expect(page.getByText('sess-1')).toBeVisible();
    await expect(page.getByText('2026-04-28 12:34:56')).toBeVisible();

    await expect(page.getByRole('link', { name: 'sessions' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: 'chat' })).toBeVisible();
  });

  test('settings menu changes the active theme', async ({ page }) => {
    await page.goto(dashboard.url);

    await page.getByRole('button', { name: 'settings' }).click();
    await page.getByRole('group', { name: 'theme' }).getByRole('button', { name: 'dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('group', { name: 'theme' }).getByRole('button', { name: 'light' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('runtime-config endpoint reflects HONCHO_WORKSPACE_ID', async ({ request }) => {
    const res = await request.get(`${dashboard.url}/api/runtime-config`);

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ workspaceId: 'ws-alpha', version: '0.1.0-test' });
  });
});
