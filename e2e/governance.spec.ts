import { test, expect } from '@playwright/test';
test('governanceroom loads and adds risk', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('GovernanceRoom: demo');
  await page.locator('.title-input').fill('Data breach');
  await page.locator('.category-input').fill('security');
  await page.locator('.score-input').fill('95');
  await page.locator('.add-btn').click();
  await expect(page.locator('.risk-list').locator('div').first()).toBeVisible();
});