import { expect, test } from '@playwright/test';
import { startDashboard, startStubHoncho } from './helpers/stub-server';

test.describe('representation flow', () => {
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

  test('renders all five items, all chips, default selection is all', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/representation`);

    await expect(page.getByText('prefers oat milk')).toBeVisible();
    await expect(page.getByText('medium roast over dark')).toBeVisible();
    await expect(page.getByText('late riser, ~9am natural')).toBeVisible();
    await expect(page.getByText('remote, async-first')).toBeVisible();
    await expect(page.getByText('prefers writing over calls')).toBeVisible();

    const allChip = page.getByRole('button', { name: /all/, pressed: true });
    await expect(allChip).toBeVisible();
    await expect(allChip).toContainText('5');
  });

  test('clicking topic chip filters reactively', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/representation`);

    await page.getByRole('button', { name: /coffee/ }).click();

    await expect(page.getByText('prefers oat milk')).toBeVisible();
    await expect(page.getByText('medium roast over dark')).toBeVisible();
    await expect(page.getByText('late riser, ~9am natural')).toHaveCount(0);
    await expect(page.getByText('remote, async-first')).toHaveCount(0);
  });

  test('clicking all again clears filter', async ({ page }) => {
    await page.goto(`${dashboard.url}/peers/peer-1/representation`);

    await page.getByRole('button', { name: /sleep/ }).click();
    await expect(page.getByText('prefers oat milk')).toHaveCount(0);

    await page.getByRole('button', { name: /^all/ }).click();
    await expect(page.getByText('prefers oat milk')).toBeVisible();
  });
});
