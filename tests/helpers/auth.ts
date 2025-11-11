import { Page } from '@playwright/test';

/**
 * Helper function để đăng nhập vào admin panel
 */
export async function loginAsAdmin(page: Page) {
  //dùng defaults
  const email = 'admin@wellington.com';
  const password =  '123456';
  
  await page.goto('/login');
  
  // Đợi form load
  await page.waitForSelector('input[id="email"], input[name="email"]', { timeout: 10000 });
  
  // Điền thông tin đăng nhập
  await page.fill('input[id="email"], input[name="email"]', email);
  await page.fill('input[id="password"], input[name="password"]', password);
  
  // Click đăng nhập
  await page.click('button[type="submit"]');
  
  // Đợi đăng nhập thành công
  try {
    // Đợi redirect đến admin page
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  } catch {
    // Kiểm tra có error message không
    const errorMessage = page.locator('text=không chính xác, text=Error, text=error, text=Email hoặc mật khẩu');
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.first().textContent();
      throw new Error(`Login failed: ${errorText}. Please check TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in .env`);
    }
    
    // Nếu không redirect, kiểm tra URL hiện tại
    const currentUrl = page.url();
    if (!currentUrl.includes('/admin')) {
      throw new Error(`Login failed. Current URL: ${currentUrl}. Please check TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in .env. Make sure you ran 'npm run seed' first.`);
    }
  }
}

/**
 * Helper function để kiểm tra đã đăng nhập chưa
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.goto('/admin/dashboard', { waitUntil: 'networkidle', timeout: 5000 });
    // Nếu không redirect về login thì đã đăng nhập
    return !page.url().includes('/login');
  } catch {
    return false;
  }
}

