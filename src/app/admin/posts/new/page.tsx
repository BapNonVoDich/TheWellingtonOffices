// src/app/admin/posts/new/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '@/app/actions/postActions';
import ImageUploader from '@/app/components/ImageUploader';
import RichTextEditor from '@/app/components/RichTextEditor';
import toast from 'react-hot-toast';

export default function NewPostPage() {
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const router = useRouter();

  // Memoize callbacks to prevent infinite loops
  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const handlePreviewChange = useCallback((newPreviews: string[]) => {
    setPreviews(newPreviews);
  }, []);

  // Upload image to Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Không thể upload ảnh');
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload image if there's a new file
      let imageUrl = '';
      if (files.length > 0) {
        imageUrl = await uploadImage(files[0]);
      } else if (previews.length > 0 && previews[0].startsWith('blob:')) {
        // If preview is a blob URL, we need to convert it to a file
        // This shouldn't happen in normal flow, but handle it just in case
        toast.error('Vui lòng chọn ảnh để upload');
        setIsSubmitting(false);
        return;
      } else if (previews.length > 0) {
        // Use existing URL from previews
        imageUrl = previews[0];
      }
      
      // Create FormData manually since we're using controlled inputs
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('imageUrl', imageUrl);
      if (published) {
        formData.append('published', 'on');
      }

      const result = await createPost(formData);
      if (result?.success) {
        toast.success('Đã tạo bài viết thành công!');
        router.push('/admin/posts');
        router.refresh();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Viết bài mới</h1>
        <p className="text-sm text-gray-600 mt-1">Tạo bài viết mới cho website của bạn</p>
        </div>

      <form onSubmit={handleSubmit} className="flex gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-xl border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tiêu đề bài viết..."
          />
        </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
          <input type="hidden" name="content" value={content} />
          <RichTextEditor
            initialContent={content}
            onChange={(newContent) => setContent(newContent)}
          />
        </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh đại diện
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Hình ảnh sẽ được hiển thị ở đầu bài viết và trong danh sách bài viết.
            </p>
            <ImageUploader 
              name="imageUrl" 
              onFilesChange={handleFilesChange}
              onPreviewChange={handlePreviewChange}
            />
          </div>
        </div>

        {/* Sidebar - Publish Box */}
        <div className="w-80 space-y-6">
          {/* Publish Box */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Xuất bản</h3>
            <div className="space-y-4">
        <div className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  Xuất bản ngay
                </label>
        </div>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Xuất bản'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/posts')}
                  className="w-full bg-white text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Hủy
          </button>
              </div>
            </div>
          </div>

          {/* Help Box */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Mẹo viết bài</h3>
            <ul className="text-xs text-blue-800 space-y-2">
              <li>• Viết tiêu đề hấp dẫn và mô tả rõ nội dung</li>
              <li>• Sử dụng hình ảnh chất lượng cao</li>
              <li>• Kiểm tra lại nội dung trước khi xuất bản</li>
              <li>• Có thể lưu bản nháp để chỉnh sửa sau</li>
            </ul>
          </div>
        </div>
      </form>
    </>
  );
}