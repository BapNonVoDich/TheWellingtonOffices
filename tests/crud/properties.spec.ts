import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { uploadImage } from '../helpers/upload';
import { selectWardOrOldWard } from '../helpers/ward-selector';

test.describe('Properties CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // Không dùng afterEach cleanup vì sẽ xóa data của test khác đang chạy song song
  // Cleanup sẽ được thực hiện trong globalTeardown

  test('Tạo property mới với upload ảnh', async ({ page }) => {
    const testPropertyName = `TEST_Property ${Date.now()}`;
    
    await page.goto('/admin/properties/new');
    await page.waitForSelector('input[name="name"]', { timeout: 20000 });
    
    // Điền thông tin property
    await page.fill('input[name="name"]', testPropertyName);
    
    // Chọn ward hoặc oldWard từ DualWardSelector
    await selectWardOrOldWard(page, true);
    
    // Upload ảnh nếu có
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await uploadImage(page);
      await page.waitForTimeout(1000);
    }
    
    // Submit
    await page.locator('button:has-text("Lưu"), button[type="submit"]').first().click();
    
    // Đợi redirect (có thể redirect đến dashboard hoặc properties)
    try {
      await page.waitForURL(/\/admin\/(dashboard|properties)/, { timeout: 30000 });
    } catch {
      await page.waitForTimeout(3000);
      if (!page.url().includes('/admin/')) {
        await page.goto('/admin/properties');
      }
    }
    
    // Navigate đến properties page nếu chưa ở đó
    if (!page.url().includes('/admin/properties')) {
      await page.goto('/admin/properties');
    }
    
    // Đợi trang load
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Kiểm tra property đã được tạo
    await expect(page.locator(`text=${testPropertyName}`).first()).toBeVisible({ timeout: 30000 });
  });

  test('Xem danh sách properties', async ({ page }) => {
    await page.goto('/admin/properties');
    
    // Đợi trang load
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra có danh sách hoặc empty state
    const hasProperties = await page.locator('.property-item, .property-card, tr, [data-testid="property-item"], table tbody tr, .grid > div').count();
    const hasEmptyState = await page.locator('text=Chưa có, text=Không có, text=Empty, text=No properties, text=chưa có').count();
    
    // Hoặc kiểm tra có tiêu đề/heading
    const hasHeading = await page.locator('h1, h2').count();
    
    expect(hasProperties > 0 || hasEmptyState > 0 || hasHeading > 0).toBeTruthy();
  });

  test('Sửa property với upload ảnh mới', async ({ page }) => {
    // Tạo property để sửa
    const testPropertyName = `TEST_Edit Property ${Date.now()}`;
    
    await page.goto('/admin/properties/new');
    await page.waitForSelector('input[name="name"]', { timeout: 20000 });
    await page.fill('input[name="name"]', testPropertyName);
    
    // Chọn ward hoặc oldWard từ DualWardSelector
    await selectWardOrOldWard(page, true);
    
    await page.locator('button:has-text("Lưu"), button[type="submit"]').first().click();
    
    // Đợi redirect (có thể redirect đến dashboard hoặc properties)
    try {
      await page.waitForURL(/\/admin\/(dashboard|properties)/, { timeout: 30000 });
    } catch {
      await page.waitForTimeout(3000);
      if (!page.url().includes('/admin/')) {
        await page.goto('/admin/properties');
      }
    }
    
    // Đợi property được tạo
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Navigate đến properties page nếu chưa ở đó
    if (!page.url().includes('/admin/properties')) {
      await page.goto('/admin/properties');
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
    }
    
    // Tìm edit link
    const editLink = page.locator(`tr:has-text("${testPropertyName}") a[href*="/admin/properties/edit/"]`).first();
    await editLink.waitFor({ state: 'visible', timeout: 30000 });

    
    // Navigate đến edit page
    const href = await editLink.getAttribute('href');
    if (href) {
      await page.goto(href);
    } else {
      await editLink.click();
    }
    
    await page.waitForURL(/\/admin\/properties\/edit\//, { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Sửa name
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 30000 });
    
    const currentName = await nameInput.inputValue();
    const newName = `${currentName} - Updated`;
    await nameInput.fill(newName);
    
    // Upload ảnh mới nếu có
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await uploadImage(page);
      await page.waitForTimeout(1000);
    }
    
    // Submit
    await page.locator('button:has-text("Cập nhật"), button[type="submit"]').first().click();
    
    // Edit property redirect đến dashboard sau khi submit
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 });
    
    // Navigate đến properties page để kiểm tra
    await page.goto('/admin/properties');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Kiểm tra đã cập nhật
    await expect(page.locator(`text=${newName}`).first()).toBeVisible({ timeout: 30000 });
  });

  test('Xóa property', async ({ page }) => {
    // Tạo property để xóa
    const testPropertyName = `TEST_Delete Property ${Date.now()}`;
    
    await page.goto('/admin/properties/new');
    await page.waitForSelector('input[name="name"]', { timeout: 20000 });
    await page.fill('input[name="name"]', testPropertyName);
    
    // Chọn ward hoặc oldWard từ DualWardSelector
    await selectWardOrOldWard(page, true);
    
    await page.locator('button:has-text("Lưu"), button[type="submit"]').first().click();
    
    // Đợi redirect
    try {
      await page.waitForURL(/\/admin\/(dashboard|properties)/, { timeout: 30000 });
    } catch {
      await page.waitForTimeout(3000);
      if (!page.url().includes('/admin/')) {
        await page.goto('/admin/properties');
      }
    }
    
    // Navigate đến properties page để kiểm tra
    await page.goto('/admin/properties');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    
    // Đợi API response
    try {
      await page.waitForResponse(response => response.url().includes('/api/properties') && response.status() === 200, { timeout: 30000 });
    } catch {
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    }
    
    await page.waitForTimeout(2000);
    
    // Đợi property xuất hiện trong table
    const propertyRow = page.locator(`tr:has-text("${testPropertyName}")`).first();
    await propertyRow.waitFor({ state: 'visible', timeout: 30000 });
    
    // Tìm delete button trong row
    const deleteButton = propertyRow.locator('button:has-text("Xóa")').first();
    await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click delete và confirm
    await deleteButton.click();
    await page.waitForSelector('.fixed.inset-0', { timeout: 10000, state: 'visible' }).catch(() => {});
    await page.waitForTimeout(500);
    
    // Click confirm trong modal
    const confirmButton = page.locator('.fixed.inset-0 button.bg-red-600, .fixed.inset-0 button:has-text("Xóa"):not(.text-red-600)').first();
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click();
    
    // Đợi modal đóng và property bị xóa
    await page.waitForSelector('.fixed.inset-0', { timeout: 10000, state: 'hidden' }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Kiểm tra property đã bị xóa
    const tableProperty = page.locator(`tbody tr:has-text("${testPropertyName}")`).first();
    await expect(tableProperty).not.toBeVisible({ timeout: 30000 });
  });
});

