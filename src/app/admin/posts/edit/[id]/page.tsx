// src/app/admin/posts/edit/[id]/page.tsx
import prisma from '@/lib/prisma'; // Import prisma
import { notFound } from 'next/navigation';
import EditPostForm from './EditPostForm'; // Import component form mới

// Page component chính là một Server Component để lấy dữ liệu
export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh sửa bài viết</h1>
      {/* Truyền dữ liệu post đã lấy được vào Client Component */}
      <EditPostForm post={post} />
    </div>
  );
}