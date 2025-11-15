// src/app/actions/cleanupActions.ts
'use server';

import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';
import { deleteImage } from '@/app/actions/cloudinaryActions';

// Validate Cloudinary environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('[Cleanup] Cloudinary credentials chưa được cấu hình. Cleanup sẽ không hoạt động.');
}

// Cấu hình Cloudinary SDK
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '', 
  api_key: process.env.CLOUDINARY_API_KEY || '', 
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

/**
 * Extract publicId from Cloudinary URL
 * Uses the same method as other actions for consistency
 * Example: https://res.cloudinary.com/xxx/image/upload/v1234567890/thewellingtonoffices/abc123.jpg
 * Returns: thewellingtonoffices/abc123
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Use the same extraction method as other actions
    const publicId = url.split('/').slice(-2).join('/').split('.')[0];
    return publicId || null;
  } catch (error) {
    console.error('Error extracting publicId from URL:', url, error);
    return null;
  }
}

/**
 * Get all image URLs from database
 */
async function getAllImageUrlsFromDatabase(): Promise<Set<string>> {
  const imageUrls = new Set<string>();

  try {
    // Get all Post images
    const posts = await prisma.post.findMany({
      select: { imageUrl: true },
    });
    posts.forEach(post => {
      if (post.imageUrl) imageUrls.add(post.imageUrl);
    });

    // Get all Property images
    const properties = await prisma.property.findMany({
      select: { imageUrls: true },
    });
    properties.forEach(property => {
      property.imageUrls.forEach(url => {
        if (url) imageUrls.add(url);
      });
    });

    // Get all Office photos
    const offices = await prisma.office.findMany({
      select: { photos: true },
    });
    offices.forEach(office => {
      office.photos.forEach(url => {
        if (url) imageUrls.add(url);
      });
    });

    // Get all SiteContent images
    const siteContents = await prisma.siteContent.findMany({
      select: { imageUrl: true },
    });
    siteContents.forEach(content => {
      if (content.imageUrl) imageUrls.add(content.imageUrl);
    });

    return imageUrls;
  } catch (error) {
    console.error('Error fetching image URLs from database:', error);
    throw error;
  }
}

/**
 * Get all images from Cloudinary in the thewellingtonoffices folder
 */
async function getAllCloudinaryImages(): Promise<string[]> {
  try {
    const publicIds: string[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'thewellingtonoffices',
        max_results: 500,
        next_cursor: nextCursor,
      });

      if (result.resources && Array.isArray(result.resources)) {
        result.resources.forEach((resource: { public_id?: string }) => {
          if (resource.public_id) {
            publicIds.push(resource.public_id);
          }
        });
      }

      nextCursor = result.next_cursor;
    } while (nextCursor);

    return publicIds;
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    throw error;
  }
}

/**
 * Cleanup orphan images - delete images from Cloudinary that are not referenced in database
 */
export async function cleanupOrphanImages() {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return {
        success: false,
        error: 'Cloudinary credentials chưa được cấu hình',
      };
    }

    console.log('Starting orphan image cleanup...');

    // Get all image URLs from database
    const dbImageUrls = await getAllImageUrlsFromDatabase();
    console.log(`Found ${dbImageUrls.size} image URLs in database`);

    // Convert database URLs to publicIds
    const dbPublicIds = new Set<string>();
    dbImageUrls.forEach(url => {
      const publicId = extractPublicIdFromUrl(url);
      if (publicId) {
        dbPublicIds.add(publicId);
      }
    });
    console.log(`Converted to ${dbPublicIds.size} publicIds from database`);

    // Get all images from Cloudinary
    const cloudinaryPublicIds = await getAllCloudinaryImages();
    console.log(`Found ${cloudinaryPublicIds.length} images in Cloudinary`);

    // Find orphan images (in Cloudinary but not in database)
    const orphanPublicIds = cloudinaryPublicIds.filter(
      publicId => !dbPublicIds.has(publicId)
    );
    console.log(`Found ${orphanPublicIds.length} orphan images to delete`);

    // Delete orphan images
    let deletedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const publicId of orphanPublicIds) {
      const result = await deleteImage(publicId);
      if (result.success) {
        deletedCount++;
      } else {
        failedCount++;
        errors.push(`${publicId}: ${result.error || 'Unknown error'}`);
      }
    }

    const summary = {
      totalCloudinaryImages: cloudinaryPublicIds.length,
      totalDatabaseImages: dbPublicIds.size,
      orphanImages: orphanPublicIds.length,
      deletedCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('Cleanup completed:', summary);
    return {
      success: true,
      ...summary,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error during cleanup:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

