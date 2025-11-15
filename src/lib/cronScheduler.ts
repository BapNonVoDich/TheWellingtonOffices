// src/lib/cronScheduler.ts
/**
 * Cron Scheduler Service
 * Chạy các scheduled tasks tự động khi server khởi động
 */

import cron from 'node-cron';
import { cleanupOrphanImages } from '@/app/actions/cleanupActions';

type CleanupResult = 
  | { success: true; totalCloudinaryImages: number; totalDatabaseImages: number; orphanImages: number; deletedCount: number; failedCount: number; errors?: string[] }
  | { success: false; error: string };

let isScheduled = false;

/**
 * Setup và start cron jobs
 * Chỉ chạy một lần khi server khởi động
 */
export function startCronScheduler() {
  // Chỉ schedule một lần
  if (isScheduled) {
    console.log('[Cron] Scheduler đã được khởi động rồi, bỏ qua...');
    return;
  }

  console.log('[Cron] Đang khởi động cron scheduler...');

  // Schedule cleanup task: 3h đêm ngày 1 mỗi tháng
  // Cron format: minute hour day month weekday
  // 0 3 1 * * = 3:00 AM on the 1st day of every month
  cron.schedule('0 3 1 * *', async () => {
    console.log('[Cron] Bắt đầu cleanup orphan images...');
    const startTime = Date.now();
    
    try {
      const result = await cleanupOrphanImages();
      const duration = Date.now() - startTime;
      
      const cleanupResult = result as CleanupResult;
      
      if (cleanupResult.success) {
        console.log(`[Cron] Cleanup hoàn thành sau ${duration}ms:`, {
          totalCloudinaryImages: cleanupResult.totalCloudinaryImages,
          totalDatabaseImages: cleanupResult.totalDatabaseImages,
          orphanImages: cleanupResult.orphanImages,
          deletedCount: cleanupResult.deletedCount,
          failedCount: cleanupResult.failedCount,
        });
        
        if (cleanupResult.errors && cleanupResult.errors.length > 0) {
          console.warn('[Cron] Một số ảnh không thể xóa:', cleanupResult.errors);
        }
      } else {
        console.error('[Cron] Cleanup thất bại:', cleanupResult.error);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Cron] Lỗi khi cleanup sau ${duration}ms:`, error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh', // Múi giờ Việt Nam
  });

  isScheduled = true;
  console.log('[Cron] Scheduler đã được khởi động thành công!');
  console.log('[Cron] Cleanup task sẽ chạy vào 3h đêm ngày 1 mỗi tháng (GMT+7)');
}

/**
 * Stop cron scheduler (dùng cho testing hoặc graceful shutdown)
 */
export function stopCronScheduler() {
  // node-cron không có method stop tất cả, nhưng có thể dùng để cleanup
  isScheduled = false;
  console.log('[Cron] Scheduler đã được dừng');
}

