// src/app/actions/postActions.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

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
  const imageUrl = formData.get('imageUrl')?.toString();
  const published = formData.get('published') === 'on';

  if (!title || !content) {
    throw new Error('Tiêu đề và Nội dung là bắt buộc.');
  }
  
  const postSlug = slugify(title);

  try {
    await prisma.post.update({
      where: { id: id },
      data: {
        title,
        slug: postSlug,
        content,
        imageUrl: imageUrl || '',
        published,
      },
    });
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
    await prisma.post.delete({
      where: { id: id },
    });
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    throw new Error('Không thể xóa bài viết.');
  }

  revalidatePath('/admin/posts');
  revalidatePath('/tin-tuc');
}