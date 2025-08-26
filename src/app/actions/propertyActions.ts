// src/app/actions/propertyActions.ts
'use server';

import { auth } from '@/lib/auth'; // Su dung ham auth cua NextAuth v5
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProperty(formData: FormData) {
  // Lay session cua user dang dang nhap o server
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Bạn phải đăng nhập để thực hiện hành động này.');
  }
  const userId = session.user.id;

  const imageUrlsString = formData.get('imageUrls')?.toString() || '';
  const imageUrls = imageUrlsString.split('\n').map(url => url.trim()).filter(url => url);

  // Lay du lieu tu form mot cach an toan
  const name = formData.get('name')?.toString() || '';
  const address_line = formData.get('address_line')?.toString() || '';
  
  
  // Tim wardId tu ten ward/district
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

  // Kiem tra du lieu co ban
  if (!name || !address_line) {
    throw new Error('Vui lòng điền đầy đủ tên và địa chỉ.');
  }

  try {
    await prisma.property.create({
      data: {
        name,
        address_line,
        imageUrls,
        wardId: wardId,
        amenities: [], // Se them sau
        createdById: userId,
        lastUpdatedById: userId,
      },
    });
  } catch (error: unknown) { // Use 'unknown' instead of 'any'
    console.error(error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      throw new Error('Tên tòa nhà này đã tồn tại.');
    }
    throw new Error('Không thể tạo tòa nhà. Vui lòng thử lại.');
  }
  

  revalidatePath('/admin/dashboard');
  redirect('/admin/dashboard');
}


// cap nhat property
export async function updateProperty(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Bạn phải đăng nhập để thực hiện hành động này.');
  }
  const userId = session.user.id;

  // Lay du lieu tu form
  const name = formData.get('name')?.toString() || '';
  const address_line = formData.get('address_line')?.toString() || '';
  const imageUrlsString = formData.get('imageUrls')?.toString() || '';
  const imageUrls = imageUrlsString.split('\n').map(url => url.trim()).filter(url => url);
  
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
        // Neu nguoi dung nhap mot phuong khong co trong combobox, ta co the bo qua hoac bao loi
        // O day ta bo qua de giu lai ward cu neu co
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
        address_line,
        imageUrls,
        wardId: wardId,
        lastUpdatedById: userId, // Cap nhat nguoi chinh sua cuoi cung
      },
    });
  } catch (error: unknown) { // Use 'unknown' instead of 'any'
    console.error(error);
    throw new Error('Không thể cập nhật tòa nhà. Vui lòng thử lại.');
  }

  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/properties/edit/${id}`);
  redirect('/admin/dashboard');
}


// Ham moi de xoa property
export async function deleteProperty(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Bạn phải đăng nhập để thực hiện hành động này.');
  }

  try {
    // Su dung transaction de dam bao ca 2 hanh dong cung thanh cong hoac that bai
    await prisma.$transaction([
      // 1. Xoa tat ca cac Office lien quan truoc
      prisma.office.deleteMany({
        where: { propertyId: id },
      }),
      // 2. Sau do moi xoa Property
      prisma.property.delete({
        where: { id: id },
      }),
    ]);
  } catch (error) {
    console.error("Lỗi khi xóa property:", error);
    throw new Error('Không thể xóa tòa nhà. Vui lòng thử lại.');
  }

  // Lam moi du lieu trang dashboard de cap nhat danh sach
  revalidatePath('/admin/dashboard');
}