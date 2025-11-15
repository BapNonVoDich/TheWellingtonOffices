// src/app/actions/officeActions.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Grade, OfficeType } from '@prisma/client';
import { deleteImage } from '@/app/actions/cloudinaryActions';

export async function createOffice(propertyId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập.');
  
  const minLease = formData.get('minimumLeaseTerm')?.toString();
  const maxLease = formData.get('maximumLeaseTerm')?.toString();

  const isAvailableStr = formData.get('isAvailable')?.toString();
  const isAvailable = isAvailableStr !== 'false'; // Default to true if not explicitly 'false'

  const data = {
    area: parseInt(formData.get('area')?.toString() || '0', 10),
    price_per_sqm: parseFloat(formData.get('price_per_sqm')?.toString() || '0'),
    floor: formData.get('floor')?.toString() || null,
    type: formData.get('type')?.toString() as OfficeType,
    grade: formData.get('grade')?.toString() as Grade,
    minimumLeaseTerm: minLease ? parseInt(minLease, 10) : null,
    maximumLeaseTerm: maxLease ? parseInt(maxLease, 10) : null,
    isAvailable: isAvailable,
    propertyId: propertyId,
    createdById: session.user.id,
    lastUpdatedById: session.user.id,
  };

  if (!data.area || !data.price_per_sqm || !data.type || !data.grade) {
    throw new Error('Diện tích, Giá, Loại hình và Hạng là bắt buộc.');
  }

  await prisma.office.create({ data });
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function updateOffice(officeId: string, propertyId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập.');

  // Get existing office to check old photos
  const existingOffice = await prisma.office.findUnique({
    where: { id: officeId },
    select: { photos: true },
  });

  if (!existingOffice) {
    throw new Error('Không tìm thấy văn phòng.');
  }

  const minLease = formData.get('minimumLeaseTerm')?.toString();
  const maxLease = formData.get('maximumLeaseTerm')?.toString();

  const isAvailableStr = formData.get('isAvailable')?.toString();
  const isAvailable = isAvailableStr !== 'false'; // Default to true if not explicitly 'false'

  // Get new photos from formData (if any)
  const newPhotos = formData.getAll('photos') as string[];
  const newPhotosArray = newPhotos.filter(url => url && url.trim() !== '');

  const data = {
    area: parseInt(formData.get('area')?.toString() || '0', 10),
    price_per_sqm: parseFloat(formData.get('price_per_sqm')?.toString() || '0'),
    floor: formData.get('floor')?.toString() || null,
    type: formData.get('type')?.toString() as OfficeType,
    grade: formData.get('grade')?.toString() as Grade,
    minimumLeaseTerm: minLease ? parseInt(minLease, 10) : null,
    maximumLeaseTerm: maxLease ? parseInt(maxLease, 10) : null,
    isAvailable: isAvailable,
    photos: newPhotosArray.length > 0 ? newPhotosArray : existingOffice.photos, // Keep old photos if no new ones
    lastUpdatedById: session.user.id,
  };

  if (!data.area || !data.price_per_sqm || !data.type || !data.grade) {
    throw new Error('Diện tích, Giá, Loại hình và Hạng là bắt buộc.');
  }

  await prisma.office.update({ where: { id: officeId }, data });

  // Delete old photos that are no longer in the new photos array
  const oldPhotos = existingOffice.photos || [];
  const photosToDelete = oldPhotos.filter(url => !newPhotosArray.includes(url));
  
  if (photosToDelete.length > 0) {
    const deletePromises = photosToDelete.map(async (url) => {
      const publicId = url.split('/').slice(-2).join('/').split('.')[0];
      if (publicId) {
        const result = await deleteImage(publicId);
        if (!result.success) {
          console.error(`Không thể xóa ảnh ${publicId}:`, result.error);
        }
      }
    });
    await Promise.all(deletePromises);
  }

  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function deleteOffice(officeId: string, propertyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập.');

  // Get office to check for photos before deleting
  const office = await prisma.office.findUnique({
    where: { id: officeId },
    select: { photos: true },
  });

  // Delete office from database
  await prisma.office.delete({ where: { id: officeId } });

  // Delete photos from Cloudinary if exists
  if (office?.photos && office.photos.length > 0) {
    const deletePromises = office.photos.map(async (url) => {
      const publicId = url.split('/').slice(-2).join('/').split('.')[0];
      if (publicId) {
        const result = await deleteImage(publicId);
        if (!result.success) {
          console.error(`Không thể xóa ảnh ${publicId}:`, result.error);
        }
      }
    });
    await Promise.all(deletePromises);
  }

  revalidatePath(`/admin/properties/${propertyId}`);
}