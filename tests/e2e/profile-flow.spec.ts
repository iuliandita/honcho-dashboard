import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('profile flow', () => {
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

  test('renders synthesized OSS representation markdown', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/profile`);

    await expect(page.getByRole('heading', { level: 2, name: 'coffee' })).toBeVisible();
    await expect(page.getByText('prefers oat milk')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'work' })).toBeVisible();
    await expect(page.getByText('prefers writing over calls')).toBeVisible();
  });

  test('strips inline scripts from rendered markdown', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/profile`);

    const html = await page.locator('.md').innerHTML();
    expect(html).not.toMatch(/<script[\s>]/);
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('alert(1)');
  });
});
