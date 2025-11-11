/**
 * Test data helpers
 * 
 * Lưu ý: Tất cả test data có prefix "Test" để dễ dàng cleanup sau
 */

const TEST_PREFIX = 'TEST_';

export const testPost = {
  title: `${TEST_PREFIX}Post ${Date.now()}`,
  content: '<p>This is a test post content for testing purposes.</p>',
  published: false,
};

export const testProperty = {
  name: `${TEST_PREFIX}Property ${Date.now()}`,
  address_line: '123 Test Street',
  slug: `test-property-${Date.now()}`,
  amenities: ['Parking', 'Elevator'],
  imageUrls: [],
};

export const testOffice = {
  area: 50,
  price_per_sqm: 25,
  floor: '5',
  grade: 'A' as const,
  type: 'TRADITIONAL' as const,
  minimumLeaseTerm: 12,
  maximumLeaseTerm: 24,
};

/**
 * Tạo file ảnh test (1x1 pixel PNG)
 */
export function createTestImageFile(): Buffer {
  // 1x1 pixel PNG image
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
}

