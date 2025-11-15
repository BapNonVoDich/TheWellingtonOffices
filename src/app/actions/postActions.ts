// src/app/actions/postActions.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { deleteImage } from '@/app/actions/cloudinaryActions';

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error('Không được phép.');
  }
  const userId = session.user.id;

  const title = formData.get('title')?.toString();
  const content = formData.get('content')?.toString();
  const imageUrl = formData.get('imageUrl')?.toString();
  const published = formData.get('published') === 'on';

  if (!title || !content) {
    throw new Error('Tiêu đề và Nội dung là bắt buộc.');
  }

  const postSlug = slugify(title);

  try {
    await prisma.post.create({
      data: {
        title,
        slug: postSlug,
        content,
        imageUrl: imageUrl || '',
        published,
        authorId: userId,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài viết:", error);
    throw new Error('Không thể tạo bài viết. Slug có thể đã tồn tại.');
  }

  revalidatePath('/admin/posts');
  revalidatePath('/tin-tuc');
  
  return { success: true };
}

// HÀM MỚI: Cập nhật bài viết
export async function updatePost(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error('Không được phép.');
  }

  const title = formData.get('title')?.toString();
  const content = formData.get('content')?.toString();
  const newImageUrl = formData.get('imageUrl')?.toString() || '';
  const published = formData.get('published') === 'on';

  if (!title || !content) {
    throw new Error('Tiêu đề và Nội dung là bắt buộc.');
  }
  
  const postSlug = slugify(title);

  try {
    // Get existing post to check old image
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!existingPost) {
      throw new Error('Không tìm thấy bài viết.');
    }

    // Update post
    await prisma.post.update({
      where: { id: id },
      data: {
        title,
        slug: postSlug,
        content,
        imageUrl: newImageUrl,
        published,
      },
    });

    // Delete old image from Cloudinary if it's different from new image
    const oldImageUrl = existingPost.imageUrl || '';
    if (oldImageUrl && oldImageUrl !== newImageUrl && oldImageUrl.trim() !== '') {
      // Extract publicId from Cloudinary URL
      const publicId = oldImageUrl.split('/').slice(-2).join('/').split('.')[0];
      if (publicId) {
        const deleteResult = await deleteImage(publicId);
        if (!deleteResult.success) {
          console.error(`Không thể xóa ảnh cũ ${publicId}:`, deleteResult.error);
          // Don't throw error, just log it - the post was already updated
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    throw new Error('Không thể cập nhật bài viết.');
  }

  revalidatePath('/admin/posts');
  revalidatePath(`/admin/posts/edit/${id}`);
  revalidatePath('/tin-tuc');
  
  return { success: true };
}

// HÀM MỚI: Xóa bài viết
export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    throw new Error('Không được phép.');
  }
  
  try {
    // Get post to check for image before deleting
    const post = await prisma.post.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    // Delete post from database
    await prisma.post.delete({
      where: { id: id },
    });

    // Delete image from Cloudinary if exists
    if (post?.imageUrl && post.imageUrl.trim() !== '') {
      const publicId = post.imageUrl.split('/').slice(-2).join('/').split('.')[0];
      if (publicId) {
        const deleteResult = await deleteImage(publicId);
        if (!deleteResult.success) {
          console.error(`Không thể xóa ảnh ${publicId}:`, deleteResult.error);
          // Don't throw error, just log it - the post was already deleted
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    throw new Error('Không thể xóa bài viết.');
  }

  revalidatePath('/admin/posts');
  revalidatePath('/tin-tuc');
}