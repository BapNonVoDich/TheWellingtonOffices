// src/app/admin/content/home/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSiteContent, updateSiteContent } from '@/app/actions/siteContentActions';
import ImageUploader from '@/app/components/ImageUploader';
import toast from 'react-hot-toast';

export default function EditHomePage() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getSiteContent('home');
        if (content) {
          setTitle(content.title || '');
          setSubtitle(content.subtitle || '');
          setDescription(content.description || '');
          setImageUrl(content.imageUrl || '');
          if (content.imageUrl) {
            setPreviews([content.imageUrl]);
          }
        }
      } catch (error) {
        toast.error('Không thể tải nội dung');
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const handlePreviewChange = useCallback((newPreviews: string[]) => {
    setPreviews(newPreviews);
  }, []);

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
      let finalImageUrl = imageUrl;
      if (files.length > 0) {
        finalImageUrl = await uploadImage(files[0]);
      } else if (previews.length > 0 && !previews[0].startsWith('blob:')) {
        finalImageUrl = previews[0];
      }

      await updateSiteContent('home', {
        title,
        subtitle,
        description,
        imageUrl: finalImageUrl,
      });

      toast.success('Đã cập nhật nội dung trang home thành công!');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa trang Home</h1>
        <p className="text-sm text-gray-600 mt-1">Cập nhật nội dung hero section của trang chủ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề chính
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-xl border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tiêu đề..."
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề phụ
          </label>
          <input
            type="text"
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tiêu đề phụ..."
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập mô tả..."
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh nền Hero
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Hình ảnh sẽ được hiển thị làm background cho hero section.
          </p>
          <ImageUploader 
            name="imageUrl" 
            defaultValue={previews} 
            onFilesChange={handleFilesChange}
            onPreviewChange={handlePreviewChange}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </>
  );
}

