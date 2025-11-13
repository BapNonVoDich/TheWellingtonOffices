// src/app/actions/siteContentActions.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type SiteContentKey = 'home' | 'contact' | 'about' | 'header' | 'footer';

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
  [key: string]: any;
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
    const metadataString = data.metadata ? JSON.stringify(data.metadata) : undefined;

    await prisma.siteContent.upsert({
      where: { key },
      update: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        content: data.content,
        metadata: metadataString,
        imageUrl: data.imageUrl,
        updatedById: userId,
      },
      create: {
        key,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        content: data.content,
        metadata: metadataString,
        imageUrl: data.imageUrl,
        updatedById: userId,
      },
    });

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

