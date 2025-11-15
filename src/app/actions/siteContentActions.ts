// src/app/actions/siteContentActions.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { deleteImage } from '@/app/actions/cloudinaryActions';

export type SiteContentKey = 'home' | 'contact' | 'about' | 'header' | 'footer';

export interface HomeSection {
  id: string; // Unique ID for the section
  title: string; // Section title (e.g., "Tòa nhà nổi bật", "Tòa nhà cao nhất")
  type: 'property' | 'post' | 'html'; // Type of items in this section
  itemIds: string[]; // Array of Property or Post IDs (for property/post types)
  order: number; // Display order
  content?: string; // HTML content for 'html' type sections
}

export interface SiteContentMetadata {
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  companyDescription?: string;
  featuredProperties?: string[]; // Deprecated - for backward compatibility
  featuredPosts?: string[]; // Deprecated - for backward compatibility
  sections?: HomeSection[]; // New flexible sections system
  [key: string]: unknown;
}

export async function getSiteContent(key: SiteContentKey) {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key },
    });
    return content;
  } catch (error) {
    console.error(`Error fetching site content for key ${key}:`, error);
    return null;
  }
}

export async function updateSiteContent(
  key: SiteContentKey,
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    content?: string;
    metadata?: SiteContentMetadata;
    imageUrl?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error('Không được phép. Chỉ admin mới có thể cập nhật nội dung.');
  }
  const userId = session.user.id;

  try {
    // Get existing content to check old image
    const existingContent = await prisma.siteContent.findUnique({
      where: { key },
      select: { imageUrl: true },
    });

    const metadataString = data.metadata ? JSON.stringify(data.metadata) : undefined;
    const newImageUrl = data.imageUrl || '';

    await prisma.siteContent.upsert({
      where: { key },
      update: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        content: data.content,
        metadata: metadataString,
        imageUrl: newImageUrl,
        updatedById: userId,
      },
      create: {
        key,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        content: data.content,
        metadata: metadataString,
        imageUrl: newImageUrl,
        updatedById: userId,
      },
    });

    // Delete old image from Cloudinary if it's different from new image
    const oldImageUrl = existingContent?.imageUrl || '';
    if (oldImageUrl && oldImageUrl !== newImageUrl && oldImageUrl.trim() !== '') {
      // Extract publicId from Cloudinary URL
      const publicId = oldImageUrl.split('/').slice(-2).join('/').split('.')[0];
      if (publicId) {
        const deleteResult = await deleteImage(publicId);
        if (!deleteResult.success) {
          console.error(`Không thể xóa ảnh cũ ${publicId}:`, deleteResult.error);
          // Don't throw error, just log it - the content was already updated
        }
      }
    }

    // Revalidate relevant paths
    if (key === 'home') {
      revalidatePath('/');
    } else if (key === 'contact') {
      revalidatePath('/lien-he');
    } else if (key === 'about') {
      revalidatePath('/ve-chung-toi');
    } else if (key === 'header' || key === 'footer') {
      revalidatePath('/', 'layout');
    }

    return { success: true };
  } catch (error) {
    console.error(`Error updating site content for key ${key}:`, error);
    throw new Error('Không thể cập nhật nội dung.');
  }
}

