import { test, expect } from '@playwright/test';

test.describe('Drag & Drop / Reordering Logic Stress Test (CRITICAL)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Ensure we have a board, list, and multiple cards
    await page.waitForSelector('[data-testid="kanban-list"]');
  });

  test('Drag within list - Correct position reordering', async ({ page }) => {
    const list = page.locator('[data-testid="kanban-list"]').nth(0);
    const card1 = list.locator('[data-testid="kanban-card"]').nth(0);
    const card2 = list.locator('[data-testid="kanban-card"]').nth(1);

    const card1Title = await card1.innerText();
    const card2Title = await card2.innerText();

    // Drag card1 below card2
    const { x, y, width, height } = (await card2.boundingBox());
    await card1.hover();
    await page.mouse.down();
    // Drag below the second card
    await page.mouse.move(x + width / 2, y + height + 10, { steps: 20 });
    await page.mouse.up();

    // Validate UI reorder (Optimistic UI)
    const newCard1Title = await list.locator('[data-testid="kanban-card"]').nth(1).innerText();
    expect(newCard1Title).toBe(card1Title);
  });

  test('Drag across lists - Transaction safety check', async ({ page }) => {
    const fromList = page.locator('[data-testid="kanban-list"]').nth(0);
    const toList = page.locator('[data-testid="kanban-list"]').nth(1);
    const card = fromList.locator('[data-testid="kanban-card"]').nth(0);
    const cardTitle = await card.innerText();

    const destListPos = (await toList.boundingBox());

    // Drag to second list (empty drop zone or after other cards)
    await card.hover();
    await page.mouse.down();
    await page.mouse.move(destListPos.x + 50, destListPos.y + 100, { steps: 30 });
    await page.mouse.up();

    // Card should be gone from first list
    await expect(fromList.getByText(cardTitle)).toBeHidden();
    // And visible in second list
    await expect(toList.getByText(cardTitle)).toBeVisible();

    // Refresh and verify backend consistency
    await page.reload();
    await expect(toList.getByText(cardTitle)).toBeVisible();
  });

  test('Failure Handling - Optimistic UI Rollback', async ({ page }) => {
    // Inject a failure at the API level (mocking the move call to return 500)
    await page.route('**/cards/move', route => route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }));

    const fromList = page.locator('[data-testid="kanban-list"]').nth(0);
    const toList = page.locator('[data-testid="kanban-list"]').nth(1);
    const card = fromList.locator('[data-testid="kanban-card"]').nth(0);
    const cardTitle = await card.innerText();

    const destListPos = (await toList.boundingBox());

    // Drag across
    await card.hover();
    await page.mouse.down();
    await page.mouse.move(destListPos.x + 50, destListPos.y + 100);
    await page.mouse.up();

    // 1. Should temporarily move (optimistic)
    await expect(toList.getByText(cardTitle)).toBeVisible();

    // 2. Should ROLLBACK after error (snaps back to original list)
    await expect(fromList.getByText(cardTitle)).toBeVisible({ timeout: 10000 });
    // 3. Should show error toast
    await expect(page.getByText(/Move failed/i)).toBeVisible();
  });
});
