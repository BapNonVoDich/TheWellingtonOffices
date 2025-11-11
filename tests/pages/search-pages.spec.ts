import { test, expect } from '@playwright/test';

test.describe('Search Pages', () => {
  test('Trang tìm văn phòng load được', async ({ page }) => {
    await page.goto('/tim-van-phong');
    
    // Kiểm tra tiêu đề
    await expect(page.locator('h1')).toContainText('Tìm kiếm Văn phòng');
    
    // Kiểm tra có search bar
    await expect(page.locator('form')).toBeVisible();
    
    // Kiểm tra không có lỗi
    const errorText = page.locator('text=Error, text=404, text=500');
    expect(await errorText.count()).toBe(0);
  });

  test('Trang tìm tòa nhà load được', async ({ page }) => {
    await page.goto('/tim-toa-nha');
    
    // Kiểm tra tiêu đề
    await expect(page.locator('h1')).toContainText('Tìm kiếm Tòa nhà');
    
    // Kiểm tra có search bar
    await expect(page.locator('form')).toBeVisible();
    
    // Kiểm tra không có lỗi
    const errorText = page.locator('text=Error, text=404, text=500');
    expect(await errorText.count()).toBe(0);
  });
});

