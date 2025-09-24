// src/app/actions/propertyActions.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { slugify } from '@/lib/utils';

export async function createProperty(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Bạn phải đăng nhập để thực hiện hành động này.');
  }
  const userId = session.user.id;

  const imageUrlsString = formData.get('imageUrls')?.toString() || '';
  const imageUrls = imageUrlsString.split('\n').map(url => url.trim()).filter(url => url);

  const name = formData.get('name')?.toString() || '';
  const address_line = formData.get('address_line')?.toString() || '';
  
  const propertySlug = slugify(`${name} ${address_line}`);
  
  const wardName = formData.get('wardName')?.toString();
  const districtName = formData.get('districtName')?.toString();
  
  let wardId = null;
  if (wardName && districtName) {
    const ward = await prisma.ward.findFirst({
      where: {
        name: wardName,
        district: {
          name: districtName,
        },
      },
    });
    if (ward) {
      wardId = ward.id;
    }
  }

  if (!name || !address_line) {
    throw new Error('Vui lòng điền đầy đủ tên và địa chỉ.');
  }

  try {
    await prisma.property.create({
      data: {
        name,
        slug: propertySlug,
        address_line,
        imageUrls,
        wardId: wardId,
        amenities: [], 
        createdById: userId,
        lastUpdatedById: userId,
      },
    });
  } catch (error: unknown) { 
    console.error(error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      throw new Error('Tên tòa nhà này đã tồn tại.');
    }
    throw new Error('Không thể tạo tòa nhà. Vui lòng thử lại.');
  }
  

  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard');
}


export async function updateProperty(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Bạn phải đăng nhập để thực hiện hành động này.');
  }
  const userId = session.user.id;

  // Lấy dữ liệu tên và địa chỉ mới từ form
  const name = formData.get('name')?.toString() || '';
  const address_line = formData.get('address_line')?.toString() || '';
  const imageUrlsString = formData.get('imageUrls')?.toString() || '';
  const imageUrls = imageUrlsString.split('\n').map(url => url.trim()).filter(url => url);
  
  // Tự động tạo slug mới dựa trên thông tin vừa cập nhật
  const propertySlug = slugify(`${name} ${address_line}`);

  const wardName = formData.get('wardName')?.toString();
  const districtName = formData.get('districtName')?.toString();
  
  let wardId: string | null = null;
  if (wardName && districtName) {
    const ward = await prisma.ward.findFirst({
      where: { name: wardName, district: { name: districtName } },
    });
    if (ward) {
      wardId = ward.id;
    } else {
        const existingProperty = await prisma.property.findUnique({ where: { id } });
        wardId = existingProperty?.wardId || null;
    }
  }

  if (!name || !address_line) {
    throw new Error('Vui lòng điền đầy đủ tên và địa chỉ.');
  }

  try {
    await prisma.property.update({
      where: { id: id },
      data: {
        name,
        slug: propertySlug, // Cập nhật slug mới vào database
        address_line,
        imageUrls,
        wardId: wardId,
        lastUpdatedById: userId,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    throw new Error('Không thể cập nhật tòa nhà. Vui lòng thử lại.');
  }

  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/properties/edit/${id}`);
  // Chuyển hướng về trang dashboard sau khi cập nhật
  redirect('/admin/dashboard');
}

export async function deleteProperty(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Bạn phải đăng nhập để thực hiện hành động này.');
  }

  try {
    await prisma.$transaction([
      prisma.office.deleteMany({
        where: { propertyId: id },
      }),
      prisma.property.delete({
        where: { id: id },
      }),
    ]);
  } catch (error) {
    console.error("Lỗi khi xóa property:", error);
    throw new Error('Không thể xóa tòa nhà. Vui lòng thử lại.');
  }

  revalidatePath('/admin/dashboard');
}