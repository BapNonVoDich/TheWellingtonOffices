// src/app/actions/propertyActions.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { deleteImage } from '@/app/actions/cloudinaryActions';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Cấu hình Cloudinary SDK với thông tin từ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "thewellingtonoffices" },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );

    file.arrayBuffer()
      .then(buffer => {
        streamifier.createReadStream(Buffer.from(buffer)).pipe(uploadStream);
      })
      .catch(err => reject(err));
  });
}

export async function createProperty(prevState: { success: boolean; message: string }, formData: FormData) {
  const imageFiles = formData.getAll('imageFiles') as File[];
  const imageUrls: string[] = [];

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'Bạn phải đăng nhập để thực hiện hành động này.' };
    }
    const userId = session.user.id;

    const uploadPromises = imageFiles.map(file => uploadToCloudinary(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    imageUrls.push(...uploadedUrls);

    const name = formData.get('name')?.toString() || '';
    
    if (!name) {
      if (imageUrls.length > 0) {
          const deletePromises = imageUrls.map(async (url) => {
            const publicId = url.split('/').slice(-2).join('/').split('.')[0];
            if (publicId) {
              await deleteImage(publicId);
            }
          });
          await Promise.all(deletePromises);
        }
      return { success: false, message: 'Vui lòng điền đầy đủ tên tòa nhà.' };
    }
    
    // Get wardId and oldWardId from hidden inputs
    const wardId = formData.get('wardId')?.toString() || null;
    const oldWardId = formData.get('oldWardId')?.toString() || null;

    // Generate address_line from ward or oldWard
    let address_line = '';
    if (wardId) {
      const ward = await prisma.ward.findUnique({
        where: { id: wardId },
        include: { district: true }
      });
      if (ward) {
        address_line = `${ward.name}, ${ward.district.name}`;
      }
    } else if (oldWardId) {
      const oldWard = await prisma.oldWard.findUnique({
        where: { id: oldWardId },
        include: { district: true }
      });
      if (oldWard) {
        address_line = `${oldWard.name}, ${oldWard.district.name}`;
      }
    }
    
    if (!address_line) {
      return { success: false, message: 'Vui lòng chọn ít nhất một địa chỉ (cũ hoặc mới).' };
    }
    
    const propertySlug = slugify(`${name} ${address_line}`);

    await prisma.property.create({
      data: {
        name,
        slug: propertySlug,
        address_line,
        imageUrls,
        wardId: wardId,
        oldWardId: oldWardId,
        amenities: [], 
        createdById: userId,
        lastUpdatedById: userId,
      },
    });
    
    revalidatePath('/admin/dashboard');
    // LOẠI BỎ HÀM redirect() Ở ĐÂY
    // Thay vào đó, chúng ta sẽ trả về một đối tượng trạng thái
    return { success: true, message: 'Đã tạo tòa nhà thành công.' };
    
  } catch (error: unknown) { 
    console.error("Lỗi khi tạo tòa nhà:", error);
    if (imageUrls.length > 0) {
      const deletePromises = imageUrls.map(async (url) => {
        const publicId = url.split('/').slice(-2).join('/').split('.')[0];
        if (publicId) {
          await deleteImage(publicId);
        }
      });
      await Promise.all(deletePromises);
    }

    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return { success: false, message: 'Tên tòa nhà này đã tồn tại.' };
    }
    return { success: false, message: 'Không thể tạo tòa nhà. Vui lòng thử lại.' };
  }
}

export async function updateProperty(id: string, prevState: { success: boolean; message: string }, formData: FormData) {
  const newImageFiles = formData.getAll('newImageFiles') as File[];
  const existingImageUrls = formData.getAll('existingImageUrls') as string[];
  const newImageUrls: string[] = [];

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'Bạn phải đăng nhập để thực hiện hành động này.' };
    }
    const userId = session.user.id;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: { imageUrls: true, wardId: true, oldWardId: true },
    });

    if (!existingProperty) {
      return { success: false, message: 'Không tìm thấy tòa nhà.' };
    }
    
    const imagesToDelete = existingProperty.imageUrls.filter(url => !existingImageUrls.includes(url));
    const deletePromises = imagesToDelete.map(async (url) => {
        const publicId = url.split('/').slice(-2).join('/').split('.')[0];
        if (publicId) {
          await deleteImage(publicId);
        }
    });
    await Promise.all(deletePromises);

    const uploadPromises = newImageFiles.map(file => uploadToCloudinary(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    newImageUrls.push(...uploadedUrls);

    const finalImageUrls = [...existingImageUrls, ...newImageUrls];

    const name = formData.get('name')?.toString() || '';
    
    if (!name) {
       if (newImageUrls.length > 0) {
        const deleteNewImages = newImageUrls.map(async (url) => {
          const publicId = url.split('/').slice(-2).join('/').split('.')[0];
          if (publicId) {
            await deleteImage(publicId);
          }
        });
        await Promise.all(deleteNewImages);
      }
      return { success: false, message: 'Vui lòng điền đầy đủ tên tòa nhà.' };
    }

    // Get wardId and oldWardId from hidden inputs
    const wardId = formData.get('wardId')?.toString() || null;
    const oldWardId = formData.get('oldWardId')?.toString() || null;

    // Generate address_line from ward or oldWard
    let address_line = '';
    if (wardId) {
      const ward = await prisma.ward.findUnique({
        where: { id: wardId },
        include: { district: true }
      });
      if (ward) {
        address_line = `${ward.name}, ${ward.district.name}`;
      }
    } else if (oldWardId) {
      const oldWard = await prisma.oldWard.findUnique({
        where: { id: oldWardId },
        include: { district: true }
      });
      if (oldWard) {
        address_line = `${oldWard.name}, ${oldWard.district.name}`;
      }
    }
    
    if (!address_line) {
      return { success: false, message: 'Vui lòng chọn ít nhất một địa chỉ (cũ hoặc mới).' };
    }

    const propertySlug = slugify(`${name} ${address_line}`);

    await prisma.property.update({
      where: { id: id },
      data: {
        name,
        slug: propertySlug,
        address_line,
        imageUrls: finalImageUrls,
        wardId: wardId,
        oldWardId: oldWardId,
        lastUpdatedById: userId,
      },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath(`/admin/properties/edit/${id}`);
    // LOẠI BỎ HÀM redirect() Ở ĐÂY
    return { success: true, message: 'Cập nhật tòa nhà thành công.' };

  } catch (error: unknown) {
    console.error("Lỗi khi cập nhật tòa nhà:", error);
    if (newImageUrls.length > 0) {
      const deleteNewImages = newImageUrls.map(async (url) => {
        const publicId = url.split('/').slice(-2).join('/').split('.')[0];
        if (publicId) {
          await deleteImage(publicId);
        }
      });
      await Promise.all(deleteNewImages);
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return { success: false, message: 'Tên tòa nhà này đã tồn tại.' };
    }
    return { success: false, message: 'Không thể cập nhật tòa nhà. Vui lòng thử lại.' };
  }
}

export async function deleteProperty(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'Bạn phải đăng nhập để thực hiện hành động này.' };
    }

    const property = await prisma.property.findUnique({
      where: { id: id },
      select: { imageUrls: true }
    });

    if (property) {
      const deletePromises = property.imageUrls.map(async (url) => {
        const publicId = url.split('/').slice(-2).join('/').split('.')[0];
        if (publicId) {
          await deleteImage(publicId);
        }
      });
      await Promise.all(deletePromises);
    }

    await prisma.$transaction([
      prisma.office.deleteMany({
        where: { propertyId: id },
      }),
      prisma.property.delete({
        where: { id: id },
      }),
    ]);

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Đã xóa tòa nhà thành công.' };

  } catch (error: unknown) {
    console.error("Lỗi khi xóa property:", error);
    return { success: false, message: 'Không thể xóa tòa nhà. Vui lòng thử lại.' };
  }
}