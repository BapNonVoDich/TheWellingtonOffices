import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Admin Pages', () => {
  test('Trang login load được', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('input[id="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Trang admin dashboard load được sau khi đăng nhập', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/dashboard');
    
    // Kiểm tra có dashboard content
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Kiểm tra không có lỗi
    const errorText = page.locator('text=Error, text=404, text=500');
    expect(await errorText.count()).toBe(0);
  });

  test('Trang admin posts load được', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/posts');
    
    // Kiểm tra có tiêu đề hoặc nút tạo mới
    await expect(
      page.locator('h1, h2, button:has-text("Tạo bài viết"), a:has-text("Tạo bài viết")')
    ).toBeVisible();
    
    // Kiểm tra không có lỗi
    const errorText = page.locator('text=Error, text=404, text=500');
    expect(await errorText.count()).toBe(0);
  });

  test('Trang admin properties load được', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/properties');
    
    // Kiểm tra có tiêu đề hoặc nút tạo mới
    await expect(
      page.locator('h1, h2, button:has-text("Tạo"), a:has-text("Tạo")')
    ).toBeVisible();
    
    // Kiểm tra không có lỗi
    const errorText = page.locator('text=Error, text=404, text=500');
    expect(await errorText.count()).toBe(0);
  });
});

