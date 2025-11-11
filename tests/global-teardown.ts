/**
 * Global teardown hook cho Playwright
 * Cleanup tất cả test data sau khi test suite chạy xong
 * 
 * Hook này được gọi tự động sau khi tất cả tests chạy xong
 */

import { cleanupAllTestData } from './helpers/cleanup';

async function globalTeardown() {
  console.log('\n🧹 Running global teardown...');
  await cleanupAllTestData();
}

export default globalTeardown;

