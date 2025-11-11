import { Page } from '@playwright/test';
import { createTestImageFile } from './test-data';

/**
 * Helper function để upload ảnh trong form
 * @param page - Playwright page object
 * @param fileInputSelector - Selector của input file (mặc định là input[type="file"] đầu tiên)
 */
export async function uploadImage(
  page: Page,
  fileInputSelector: string = 'input[type="file"]'
) {
  const testImage = createTestImageFile();
  
  // Tìm file input
  const fileInput = page.locator(fileInputSelector).first();
  
  // Kiểm tra có file input không
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: testImage,
    });
    
    // Đợi upload hoàn tất (có thể cần điều chỉnh tùy vào implementation)
    await page.waitForTimeout(1000);
  }
}

