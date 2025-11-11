// src/app/admin/posts/edit/[id]/page.tsx
import prisma from '@/lib/prisma'; // Import prisma
import { notFound } from 'next/navigation';
import EditPostForm from './EditPostForm'; // Import component form mới

// Page component chính là một Server Component để lấy dữ liệu
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
        <p className="text-sm text-gray-600 mt-1">Cập nhật thông tin và nội dung bài viết</p>
      </div>
      <EditPostForm post={post} />
    </>
  );
}