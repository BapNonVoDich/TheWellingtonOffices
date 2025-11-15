// src/app/api/cron/cleanup-images/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cleanupOrphanImages } from '@/app/actions/cleanupActions';

/**
 * Cron job endpoint to cleanup orphan images
 * Schedule: 3h đêm ngày 1 mỗi tháng (0 3 1 * *)
 * 
 * Security: This endpoint should be protected by:
 * 1. Vercel Cron Secret (if using Vercel Cron)
 * 2. Or a secret token in Authorization header
 */
export async function GET(req: NextRequest) {
  try {
    // Verify request is from cron job (Vercel Cron sends Authorization header)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, verify it
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Run cleanup
    const result = await cleanupOrphanImages();

    if (result.success && 'totalCloudinaryImages' in result) {
      return NextResponse.json({
        success: true,
        message: 'Cleanup completed successfully',
        summary: {
          totalCloudinaryImages: result.totalCloudinaryImages,
          totalDatabaseImages: result.totalDatabaseImages,
          orphanImages: result.orphanImages,
          deletedCount: result.deletedCount,
          failedCount: result.failedCount,
        },
        errors: result.errors,
      });
    } else {
      const errorMsg = 'error' in result ? result.error : 'Unknown error';
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in cleanup cron job:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}

