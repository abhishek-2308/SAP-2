import { test, expect } from '@playwright/test';

test.describe('Visual & UI Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and seed or ensure a board exists (using the default localhost)
    await page.goto('http://localhost:3000');
  });

  test('Matches desktop board screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Wait for data load animations to settle
    await page.waitForTimeout(2000);
    // Visual snapshot comparison
    await expect(page).toHaveScreenshot('board-desktop.png', {
      maxDiffPixelRatio: 0.05, // Allow slight differences in anti-aliasing
    });
  });

  test('Matches mobile board screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('board-mobile.png');
  });

  test('Matches Card Modal visual layout', async ({ page }) => {
    // Click on the first card
    await page.click('[data-testid="kanban-card"] >> nth=0');
    // Ensure modal appears
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await page.waitForTimeout(1000);
    // Take modal screenshot
    await expect(modal).toHaveScreenshot('card-modal.png');
  });
});
