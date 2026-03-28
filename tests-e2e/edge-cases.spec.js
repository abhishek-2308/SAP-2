import { test, expect } from '@playwright/test';

test.describe('E2E Edge Cases & Failure Handling', () => {

  test('1. Empty Board Initialization & UI scaling', async ({ page }) => {
    // Navigate home and create a fresh board to guarantee an empty state
    await page.goto('/');
    await page.getByRole('button', { name: '+ Create new board' }).click();
    await page.getByPlaceholder('Board title...').fill('Empty Board Edge Case');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page).toHaveURL(/\/board\/\d+/);

    // Verify canvas renders but no lists populate except the "Add list" placeholder
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '+ Add another list' })).toBeVisible();

    // The background should still cover the full viewport
    const mainCanvas = page.locator('main');
    const box = await mainCanvas.boundingBox();
    expect(box.height).toBeGreaterThan(500);
  });

  test('2. Optimistic UI Rollback on Network Failure during Drag & Drop', async ({ page }) => {
    // 1. Setup Board, List, and Card normally
    await page.goto('/');
    await page.getByRole('button', { name: '+ Create new board' }).click();
    await page.getByPlaceholder('Board title...').fill('Rollback Test Board');
    await page.getByRole('button', { name: 'Create' }).click();

    // Create 2 lists
    await page.getByRole('button', { name: '+ Add another list' }).click();
    await page.getByPlaceholder('Enter list title...').fill('Source List');
    await page.getByRole('button', { name: 'Add list' }).keyboard.press('Enter');

    await page.getByRole('button', { name: '+ Add another list' }).click();
    await page.getByPlaceholder('Enter list title...').fill('Target List');
    await page.getByRole('button', { name: 'Add list' }).keyboard.press('Enter');

    // Add a card to Source List
    await page.getByRole('button', { name: '+ Add a card' }).first().click();
    await page.getByPlaceholder('Enter card title...').fill('Failing Drag Card');
    await page.keyboard.press('Enter');

    // Wait for the card to be visible in the DOM
    await expect(page.getByText('Failing Drag Card')).toBeVisible();

    // 2. Intercept the network request to explicitly fail the `/cards/move` endpoint
    // This allows us to observe the UI rollback in real-time.
    await page.route('**/cards/move', async (route) => {
      // Simulate 500 Internal Server error directly from the network layer
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Simulated Network Failure' }),
      });
    });

    // 3. Perform Drag and Drop simulation
    const card = page.getByText('Failing Drag Card');
    const targetList = page.locator('div').filter({ hasText: /^Target List0\+ Add a card$/ });

    // Ensure the card is currently in the Source List visually
    const sourceList = page.locator('div').filter({ hasText: /^Source List1\+ Add a card$/ });
    await expect(sourceList.locator(card)).toBeVisible();

    // Drag to Target List
    await card.hover();
    await page.mouse.down();
    await targetList.hover();
    // A small delay to witness the "Optimistic UI" rendering it in the Target List briefly
    await page.waitForTimeout(200); 
    await page.mouse.up();

    // 4. Verification: The card should rollback to the Source List!
    // Give the React query some time to process the 500 error catch block and trigger the Zustand rollback
    await page.waitForTimeout(500);
    
    // Check it no longer exists in Target List, but returned safely to Source List
    await expect(targetList.locator(card)).toHaveCount(0);
    await expect(sourceList.locator(card)).toBeVisible();
  });

  test('3. Rapid Action / Spam Click Handling', async ({ page }) => {
    // Ensure rapid clicking on standard buttons doesn't duplicate actions aggressively
    await page.goto('/');
    await page.getByRole('button', { name: '+ Create new board' }).click();
    await page.getByPlaceholder('Board title...').fill('Spam Click Defense');

    const createBtn = page.getByRole('button', { name: 'Create' });
    
    // Click 5 times in rapid succession
    await createBtn.click();
    await createBtn.click({ force: true });
    await createBtn.click({ force: true });
    
    // Wait for route change to ensure creation occurred
    await expect(page).toHaveURL(/\/board\/\d+/);

    // Go back to Home and ensure ONLY ONE board named "Spam Click Defense" was created
    await page.goto('/');
    const duplicateBoards = page.getByRole('heading', { level: 3, name: 'Spam Click Defense' });
    await expect(duplicateBoards).toHaveCount(1);
  });
});
