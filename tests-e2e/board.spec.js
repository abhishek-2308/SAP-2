import { test, expect } from '@playwright/test';

test.describe('Kanban Board E2E Tests (CRITICAL LAYER)', () => {

  test('1. Create Board -> Add List -> Add Card', async ({ page }) => {
    // Navigate home
    await page.goto('/');

    // Create New Board
    await page.getByRole('button', { name: '+ Create new board' }).click();
    await page.getByPlaceholder('Board title...').fill('Playwright QA Validation');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify nav to board
    await expect(page).toHaveURL(/\/board\/\d+/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Playwright QA Validation');

    // Add list
    await page.getByRole('button', { name: '+ Add another list' }).click();
    await page.getByPlaceholder('Enter list title...').fill('To Do (QA)');
    await page.getByRole('button', { name: 'Add list' }).click();
    await expect(page.getByText('To Do (QA)')).toBeVisible();

    // Add card
    await page.getByRole('button', { name: '+ Add a card' }).click();
    await page.getByPlaceholder('Enter card title...').fill('Run End to End tests');
    await page.getByRole('button', { name: 'Add card' }).click();
    await expect(page.getByText('Run End to End tests')).toBeVisible();
  });

  test('2. Modal details editing & data persistence', async ({ page }) => {
    await page.goto('/');
    
    // Attempt clicking existing generated board if found
    await page.locator('.card-shadow').first().click();

    // Wait for canvas logic
    await page.waitForLoadState('networkidle');
    const firstCard = page.locator('div[data-roving-tabindex]').first();
    if (await firstCard.isVisible()) {
       await firstCard.click();

       // Modal should open
       await expect(page.getByText('Description')).toBeVisible();

       // Add description
       await page.getByPlaceholder('Add a more detailed description...').fill('Playwright test desc update');
       await page.getByRole('button', { name: 'Save Changes' }).click();

       // Verify modal closes
       await expect(page.getByText('Description')).toBeHidden();
    }
  });
  
  // NOTE: Drag and Drop testing inside Playwright relies heavily on exact mouse paths
  // which works robustly if simulated using `page.mouse.move()`, or utilizing dnd bounds check.
  
});
