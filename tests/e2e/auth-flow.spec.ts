import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('password auth', () => {
  let stub: Awaited<ReturnType<typeof startStubHoncho>>;
  let dashboard: Awaited<ReturnType<typeof startDashboard>>;

  test.beforeAll(async () => {
    stub = await startStubHoncho();
    dashboard = await startDashboard({
      apiBase: stub.url,
      workspaceId: 'ws-alpha',
      env: {
        DASHBOARD_AUTH_MODE: 'password',
        DASHBOARD_AUTH_PASSWORD: 'secret',
        DASHBOARD_SESSION_SECRET: '0123456789abcdef0123456789abcdef',
      },
    });
  });

  test.afterAll(async () => {
    await dashboard?.stop();
    await stub?.stop();
  });

  test('logs in with English UI', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers`);
    await expect(page.getByText('Dashboard access is protected.')).toBeVisible();
    await page.getByLabel('password').fill('secret');
    await page.getByRole('button', { name: 'unlock dashboard' }).click();
    await expect(page.getByText('hermes')).toBeVisible();
  });

  test('allows German selection before login', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers`);
    await page.getByLabel('language').selectOption('de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await page.getByLabel('Passwort').fill('secret');
    await page.getByRole('button', { name: 'Dashboard entsperren' }).click();
    await expect(page.getByRole('link', { name: 'Suche' })).toBeVisible();
  });

  test('rejects a wrong password', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers`);
    await page.getByLabel('password').fill('wrong');
    await page.getByRole('button', { name: 'unlock dashboard' }).click();
    await expect(page.getByText('Password did not match.')).toBeVisible();
  });
});
