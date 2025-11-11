import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('Trang chủ load được và hiển thị đúng nội dung', async ({ page }) => {
    await page.goto('/');
    
    // Kiểm tra hero section
    await expect(page.locator('h1')).toContainText('Không Gian Làm Việc');
    
    // Kiểm tra có section tòa nhà nổi bật
    await expect(page.locator('text=Các tòa nhà nổi bật')).toBeVisible();
    
    // Kiểm tra không có lỗi
    const errorText = page.locator('text=Error, text=404, text=500');
    expect(await errorText.count()).toBe(0);
  });

  test('Có thể click vào property từ homepage', async ({ page }) => {
    await page.goto('/');
    
    // Đợi properties load
    await page.waitForSelector('a[href^="/property/"]', { timeout: 10000 });
    
    // Lấy href của property đầu tiên
    const firstProperty = page.locator('a[href^="/property/"]').first();
    const href = await firstProperty.getAttribute('href');
    
    if (href) {
      // Click vào property đầu tiên và đợi navigation
      await Promise.all([
        page.waitForURL(/\/property\/.+/, { timeout: 10000 }),
        firstProperty.click()
      ]);
      
      // Kiểm tra đã chuyển đến trang property detail
      await expect(page).toHaveURL(/\/property\/.+/);
    } else {
      test.skip(); // Skip nếu không có property nào
    }
  });
});

