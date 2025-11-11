import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { uploadImage } from '../helpers/upload';
import { cleanupTestPosts } from '../helpers/cleanup';

test.describe('Posts CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // Không dùng afterEach cleanup vì sẽ xóa data của test khác đang chạy song song
  // Cleanup sẽ được thực hiện trong globalTeardown

  test('Tạo bài viết mới với upload ảnh', async ({ page }) => {
    const testPostTitle = `TEST_Post ${Date.now()}`;
    
    await page.goto('/admin/posts/new');
    await page.waitForSelector('input[name="title"]', { timeout: 20000 });
    
    // Điền tiêu đề
    await page.fill('input[name="title"]', testPostTitle);
    
    // Upload ảnh nếu có
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await uploadImage(page);
      await page.waitForTimeout(1000);
    }
    
    // Điền nội dung
    const contentInput = page.locator('[contenteditable="true"]').first();
    if (await contentInput.count() > 0) {
      await contentInput.click();
      await contentInput.fill('<p>Test content</p>');
      await page.waitForTimeout(500);
    }
    
    // Submit
    await page.locator('button:has-text("Xuất bản"), button[type="submit"]').first().click();
    await page.waitForURL(/\/admin\/posts/, { timeout: 30000 });
    
    // Đợi API response
    try {
      await page.waitForResponse(response => response.url().includes('/api/posts') && response.status() === 200, { timeout: 30000 });
    } catch {
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    }
    
    await page.waitForTimeout(2000);
    
    // Kiểm tra post đã được tạo
    await expect(page.locator(`text=${testPostTitle}`).first()).toBeVisible({ timeout: 30000 });
  });

  test('Xem danh sách bài viết', async ({ page }) => {
    await page.goto('/admin/posts');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    // Kiểm tra có content (table, empty state, hoặc heading)
    const hasTable = await page.locator('table').count();
    const hasHeading = await page.locator('h1').count();
    const hasEmptyState = await page.locator('text=Chưa có, text=Không có').count();
    
    expect(hasTable > 0 || hasHeading > 0 || hasEmptyState > 0).toBeTruthy();
  });

  test('Sửa bài viết', async ({ page }) => {
    // Tạo post để sửa
    const testPostTitle = `TEST_Edit ${Date.now()}`;
    
    await page.goto('/admin/posts/new');
    await page.waitForSelector('input[name="title"]', { timeout: 20000 });
    await page.fill('input[name="title"]', testPostTitle);
    
    const contentInput = page.locator('[contenteditable="true"]').first();
    if (await contentInput.count() > 0) {
      await contentInput.click();
      await contentInput.fill('<p>Original content</p>');
      await page.waitForTimeout(500);
    }
    
    await page.locator('button:has-text("Xuất bản"), button[type="submit"]').first().click();
    await page.waitForURL(/\/admin\/posts/, { timeout: 30000 });
    
    // Đợi post được tạo
    try {
      await page.waitForResponse(response => response.url().includes('/api/posts') && response.status() === 200, { timeout: 30000 });
    } catch {
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    }
    
    await page.waitForTimeout(2000);
    
    // Tìm edit link
    const editLink = page.locator(`tr:has-text("${testPostTitle}") a[href*="/admin/posts/edit/"]`).first();
    await editLink.waitFor({ state: 'visible', timeout: 30000 });
    
    // Navigate đến edit page
    const href = await editLink.getAttribute('href');
    if (href) {
      await page.goto(href);
    } else {
      await editLink.click();
    }
    
    await page.waitForURL(/\/admin\/posts\/edit\//, { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Sửa title
    const titleInput = page.locator('input[name="title"]').first();
    await titleInput.waitFor({ state: 'visible', timeout: 30000 });
    
    const currentTitle = await titleInput.inputValue();
    const newTitle = `${currentTitle} - Updated`;
    await titleInput.fill(newTitle);
    
    // Submit
    await page.locator('button:has-text("Cập nhật"), button[type="submit"]').first().click();
    await page.waitForURL(/\/admin\/posts/, { timeout: 30000 });
    
    // Kiểm tra đã cập nhật
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${newTitle}`).first()).toBeVisible({ timeout: 30000 });
  });

  test('Xóa bài viết', async ({ page }) => {
    // Tạo post để xóa
    const testPostTitle = `TEST_Delete ${Date.now()}`;
    
    await page.goto('/admin/posts/new');
    await page.waitForSelector('input[name="title"]', { timeout: 20000 });
    await page.fill('input[name="title"]', testPostTitle);
    
    const contentInput = page.locator('[contenteditable="true"]').first();
    if (await contentInput.count() > 0) {
      await contentInput.click();
      await contentInput.fill('<p>Content to delete</p>');
      await page.waitForTimeout(500);
    }
    
    await page.locator('button:has-text("Xuất bản"), button[type="submit"]').first().click();
    await page.waitForURL(/\/admin\/posts/, { timeout: 30000 });
    
    // Đợi post được tạo
    try {
      await page.waitForResponse(response => response.url().includes('/api/posts') && response.status() === 200, { timeout: 30000 });
    } catch {
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    }
    
    await page.waitForTimeout(2000);
    
    // Tìm delete button
    const deleteButton = page.locator(`tr:has-text("${testPostTitle}") button:has-text("Xóa")`).first();
    await deleteButton.waitFor({ state: 'visible', timeout: 30000 });
    
    // Click delete và confirm
    await deleteButton.click();
    await page.waitForSelector('.fixed.inset-0', { timeout: 10000, state: 'visible' }).catch(() => {});
    await page.waitForTimeout(500);
    
    // Click confirm trong modal
    const confirmButton = page.locator('.fixed.inset-0 button.bg-red-600, .fixed.inset-0 button:has-text("Xóa"):not(.text-red-600)').first();
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click();
    
    // Đợi modal đóng và post bị xóa
    await page.waitForSelector('.fixed.inset-0', { timeout: 10000, state: 'hidden' }).catch(() => {});
    
    try {
      await page.waitForResponse(response => response.url().includes('/api/posts') && response.status() === 200, { timeout: 30000 });
    } catch {
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    }
    
    await page.waitForTimeout(2000);
    
    // Kiểm tra post đã bị xóa
    const tablePost = page.locator(`tbody tr:has-text("${testPostTitle}")`).first();
    await expect(tablePost).not.toBeVisible({ timeout: 30000 });
  });
});
