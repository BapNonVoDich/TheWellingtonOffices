// src/app/admin/posts/edit/[id]/EditPostForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { updatePost } from '@/app/actions/postActions';
import ImageUploader from '@/app/components/ImageUploader';
import RichTextEditor from '@/app/components/RichTextEditor';
import type { Post } from '@prisma/client';
import toast from 'react-hot-toast';

export default function EditPostForm({ post }: { post: Post }) {
  const [content, setContent] = useState(post.content);
  const [published, setPublished] = useState(post.published);
  const [title, setTitle] = useState(post.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(post.imageUrl ? [post.imageUrl] : []);
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
      // Determine imageUrl based on current state
      let imageUrl = '';
      
      if (files.length > 0) {
        // New file uploaded - upload to Cloudinary
        imageUrl = await uploadImage(files[0]);
      } else if (previews.length > 0) {
        // Check if preview is a valid URL (not blob)
        const previewUrl = previews[0];
        if (previewUrl && !previewUrl.startsWith('blob:')) {
          // Use existing URL from previews (keep current image)
          imageUrl = previewUrl;
        }
        // If it's a blob URL and no files, it means user removed the image
        // imageUrl will remain empty string
      } else {
        // No previews and no files - user deleted the image
        imageUrl = '';
      }
      
      // Create FormData manually since we're using controlled inputs
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('imageUrl', imageUrl);
      if (published) {
        formData.append('published', 'on');
      }

      const result = await updatePost(post.id, formData);
      if (result?.success) {
        toast.success('Đã cập nhật bài viết thành công!');
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
            defaultValue={post.imageUrl ? [post.imageUrl] : []} 
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
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Đã tạo:</div>
              <div className="text-sm text-gray-900">
                {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Cập nhật lần cuối:</div>
              <div className="text-sm text-gray-900">
                {new Date(post.updatedAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
      </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
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

        {/* Post Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Thông tin bài viết</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Slug:</div>
              <div className="text-gray-900 font-mono text-xs bg-gray-50 p-2 rounded break-all">
                {post.slug}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">URL:</div>
              <a
                href={`/tin-tuc/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs break-all"
              >
                /tin-tuc/{post.slug}
              </a>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}