// src/app/admin/posts/edit/[id]/page.tsx
import { updatePost } from '@/app/actions/postActions';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ImageUploader from '@/app/components/ImageUploader';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    notFound();
  }

  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh sửa bài viết</h1>
      <form action={updatePostWithId} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input type="text" name="title" id="title" required defaultValue={post.title} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL Hình ảnh đại diện</label>
          <ImageUploader name="imageUrl" defaultValue={post.imageUrl || ''} />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Nội dung</label>
          <textarea name="content" id="content" rows={15} required defaultValue={post.content} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="published" id="published" defaultChecked={post.published} className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
          <label htmlFor="published" className="ml-2 block text-sm text-gray-900">Xuất bản</label>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700">
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
}