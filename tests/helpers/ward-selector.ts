import { Page } from '@playwright/test';

/**
 * Helper function để chọn ward hoặc oldWard từ DualWardSelector
 * @param page - Playwright page object
 * @param preferWard - Ưu tiên chọn ward (địa chỉ mới) nếu true, oldWard (địa chỉ cũ) nếu false
 */
export async function selectWardOrOldWard(page: Page, preferWard: boolean = true) {
  if (preferWard) {
    // Thử chọn ward (địa chỉ mới) trước
    const wardInput = page.locator('input[placeholder*="Phường/Xã mới"], input[placeholder*="địa chỉ mới"]').first();
    if (await wardInput.count() > 0) {
      await wardInput.click();
      await page.waitForTimeout(500);
      await wardInput.fill('Phường');
      await page.waitForTimeout(500);
      const wardOption = page.locator('[role="option"]').first();
      if (await wardOption.count() > 0) {
        await wardOption.click();
        await page.waitForTimeout(500);
        return;
      }
    }
  }

  // Fallback: chọn oldWard (địa chỉ cũ)
  const oldWardInput = page.locator('input[placeholder*="Phường/Xã cũ"], input[placeholder*="địa chỉ cũ"]').first();
  if (await oldWardInput.count() > 0) {
    await oldWardInput.click();
    await page.waitForTimeout(500);
    await oldWardInput.fill('Phường');
    await page.waitForTimeout(500);
    const oldWardOption = page.locator('[role="option"]').first();
    if (await oldWardOption.count() > 0) {
      await oldWardOption.click();
      await page.waitForTimeout(500);
    }
  }
}

