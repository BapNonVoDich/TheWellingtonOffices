// src/app/actions/officeActions.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Grade, OfficeType } from '@prisma/client';

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
    lastUpdatedById: session.user.id,
  };

  if (!data.area || !data.price_per_sqm || !data.type || !data.grade) {
    throw new Error('Diện tích, Giá, Loại hình và Hạng là bắt buộc.');
  }

  await prisma.office.update({ where: { id: officeId }, data });
  revalidatePath(`/admin/properties/${propertyId}`);
}

export async function deleteOffice(officeId: string, propertyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập.');

  await prisma.office.delete({ where: { id: officeId } });
  revalidatePath(`/admin/properties/${propertyId}`);
}