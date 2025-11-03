// src/app/admin/posts/new/page.tsx
'use client';

import { useState } from 'react';
import { createPost } from '@/app/actions/postActions';
import ImageUploader from '@/app/components/ImageUploader';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function NewPostPage() {
  const [content, setContent] = useState('');

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tạo bài viết mới</h1>
      <form action={createPost} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input type="text" name="title" id="title" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL Hình ảnh đại diện</label>
          <ImageUploader 
            name="imageUrl" 
            onFilesChange={() => {}}
            onPreviewChange={() => {}}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Nội dung</label>
          <input type="hidden" name="content" value={content} />
          <RichTextEditor
            initialContent={content}
            onChange={(newContent) => setContent(newContent)}
          />
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="published" id="published" className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
          <label htmlFor="published" className="ml-2 block text-sm text-gray-900">Xuất bản ngay</label>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700">
            Lưu bài viết
          </button>
        </div>
      </form>
    </div>
  );
}