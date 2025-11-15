// instrumentation.ts
/**
 * Next.js Instrumentation Hook
 * File này được Next.js tự động chạy khi server khởi động
 * Chỉ chạy trên server-side, không chạy trong browser
 */

export async function register() {
  // Chỉ chạy trên server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCronScheduler } = await import('./src/lib/cronScheduler');
    
    // Khởi động cron scheduler
    startCronScheduler();
    
    console.log('[Instrumentation] Cron scheduler đã được khởi động');
  }
}

