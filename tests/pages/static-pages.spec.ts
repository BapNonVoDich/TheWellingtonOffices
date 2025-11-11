import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  test('Trang về chúng tôi load được', async ({ page }) => {
    await page.goto('/ve-chung-toi');
    
    await expect(page.locator('h1, h2')).toContainText('Về The Wellington Offices');
    
    // Kiểm tra không có lỗi (cách đơn giản hơn)
    const errorText = page.locator('text=Error, text=404, text=500');
    expect(await errorText.count()).toBe(0);
  });


  test('Trang tin tức load được', async ({ page }) => {
    await page.goto('/tin-tuc');
    
    await expect(page.locator('h1')).toContainText('Tin tức');
    
    // Kiểm tra không có lỗi
    const errorText = page.locator('text=Error, text=404, text=500');
    expect(await errorText.count()).toBe(0);
  });
});

