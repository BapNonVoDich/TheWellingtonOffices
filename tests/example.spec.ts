/**
 * Example test file để bạn test thử
 * Chạy: npm test -- tests/example.spec.ts
 */

import { test, expect } from '@playwright/test';

test('Example: Trang chủ load được', async ({ page }) => {
  await page.goto('/');
  
  // Kiểm tra có tiêu đề
  await expect(page.locator('h1')).toContainText('Không Gian Làm Việc');
  
  console.log('✅ Test passed! Trang chủ load được.');
});

