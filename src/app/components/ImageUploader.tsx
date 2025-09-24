// src/app/components/ImageUploader.tsx
'use client';

import { useState, useTransition, ChangeEvent, useRef, DragEvent } from 'react';
import { CloudArrowUpIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'; // Thêm PhotoIcon
import Image from 'next/image';
import { deleteImage } from '@/app/actions/cloudinaryActions';

const getPublicIdFromUrl = (url: string): string => {
  const urlParts = url.split('/');
  const uploadIndex = urlParts.indexOf('upload');
  if (uploadIndex === -1) {
    return '';
  }
  
  let publicIdParts = urlParts.slice(uploadIndex + 1);
  if (publicIdParts[0]?.startsWith('v') && !isNaN(Number(publicIdParts[0].substring(1)))) {
    publicIdParts = publicIdParts.slice(1);
  }

  const filenameWithExtension = publicIdParts.pop();
  const filename = filenameWithExtension?.split('.')[0];
  
  if (!filename) return '';
  
  const publicId = [...publicIdParts, filename].join('/');

  return publicId;
};

interface ImageUploaderProps {
  name: string;
  isMultiple?: boolean;
  defaultValue?: string | string[];
}

export default function ImageUploader({ name, isMultiple = false, defaultValue }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : (defaultValue ? [defaultValue] : [])
  );
  const [isPending, startTransition] = useTransition();
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    startTransition(async () => {
      const newImageUrls: string[] = [];
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            newImageUrls.push(data.url);
          } else {
            console.error('Upload failed', await res.text());
          }
        } catch (error) {
          console.error('Upload failed', error);
        }
      });
      
      await Promise.all(uploadPromises);

      if (isMultiple) {
        setImages((prevImages) => [...prevImages, ...newImageUrls]);
      } else {
        setImages(newImageUrls.slice(0, 1));
      }
    });
  };
  
  const handleRemoveImage = (urlToRemove: string) => {
    const publicId = getPublicIdFromUrl(urlToRemove);
    if (publicId) {
      deleteImage(publicId).then((result) => {
        if (result.success) {
          console.log(`Image ${publicId} deleted successfully from Cloudinary.`);
        } else {
          console.error(`Failed to delete image ${publicId} from Cloudinary.`, result.error);
        }
      });
    }
    setImages(images.filter(url => url !== urlToRemove));
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const newImages = [...images];
    const draggedImage = newImages.splice(dragItem.current, 1)[0];
    newImages.splice(dragOverItem.current, 0, draggedImage);
    setImages(newImages);

    dragItem.current = null;
    dragOverItem.current = null;
  };
  
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    handleSort();
  };
  
  return (
    <div>
      <div className="mt-2 flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div 
            key={url} 
            className="relative w-40 h-40 rounded-lg overflow-hidden border cursor-grab"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Logic render ảnh và xử lý lỗi */}
            <div className="relative w-40 h-auto">
                  <Image 
                  src={url} 
                  alt="Uploaded"
                  width={160}
                  height={120} // hoặc auto
                  className="rounded-lg border object-contain bg-gray-100"
                  />
            </div>

            <button
              type="button"
              onClick={() => handleRemoveImage(url)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
              aria-label="Xóa hình ảnh"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        {(!isMultiple && images.length === 0) || isMultiple ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className={`flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-lg text-gray-500 transition hover:border-blue-600 hover:text-blue-600 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CloudArrowUpIcon className="h-8 w-8" />
            <span className="mt-2 text-sm">
              {isPending ? 'Đang tải...' : 'Chọn hình ảnh'}
            </span>
          </button>
        ) : null}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        name="files"
        multiple={isMultiple}
        accept="image/*"
        className="hidden"
      />
      {images.map((url, index) => (
        <input key={index} type="hidden" name={name} value={url} />
      ))}
    </div>
  );
}