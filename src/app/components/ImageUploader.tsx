// src/app/components/ImageUploader.tsx
'use client';

import { useState, useRef, ChangeEvent, DragEvent, useEffect, useMemo } from 'react';
import { CloudArrowUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageUploaderProps {
  name: string;
  isMultiple?: boolean;
  defaultValue?: string[];
  onFilesChange: (files: File[]) => void;
  onPreviewChange: (previews: string[]) => void;
}

// Helper function to validate if a string is a valid URL
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  try {
    new URL(url);
    return true;
  } catch {
    // Also check if it's a blob URL (for local file previews)
    if (typeof url === 'string' && url.startsWith('blob:')) return true;
    return false;
  }
};

export default function ImageUploader({ name, isMultiple = false, defaultValue = [], onFilesChange, onPreviewChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Filter out invalid URLs from defaultValue
  const validDefaultValues = (defaultValue || []).filter(url => isValidUrl(url));
  const [previews, setPreviews] = useState<string[]>(validDefaultValues);
  const [files, setFiles] = useState<File[]>([]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const [localUrls, setLocalUrls] = useState<string[]>([]);

  // Memoize valid previews to avoid unnecessary updates
  const validPreviews = useMemo(() => {
    return previews.filter(url => isValidUrl(url));
  }, [previews]);

  // Use ref to track previous validPreviews to avoid unnecessary updates
  const prevValidPreviewsRef = useRef<string[]>([]);

  useEffect(() => {
    // Only call onPreviewChange if validPreviews actually changed
    const hasChanged = 
      validPreviews.length !== prevValidPreviewsRef.current.length ||
      validPreviews.some((url, index) => url !== prevValidPreviewsRef.current[index]);
    
    if (hasChanged) {
      prevValidPreviewsRef.current = validPreviews;
      onPreviewChange(validPreviews);
    }
  }, [validPreviews, onPreviewChange]);

  // Separate effect for cleanup
  useEffect(() => {
    return () => {
      localUrls.forEach(url => URL.revokeObjectURL(url));
    }
  }, [localUrls]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const newFiles = Array.from(event.target.files);
    const newLocalUrls = newFiles.map(file => URL.createObjectURL(file));

    let updatedFiles;
    let newPreviews;
    let updatedLocalUrls;

    if (isMultiple) {
      updatedFiles = [...files, ...newFiles];
      newPreviews = [...previews, ...newLocalUrls];
      updatedLocalUrls = [...localUrls, ...newLocalUrls];
    } else {
      localUrls.forEach(url => URL.revokeObjectURL(url)); 
      updatedFiles = newFiles;
      newPreviews = newLocalUrls;
      updatedLocalUrls = newLocalUrls;
    }
    
    setFiles(updatedFiles);
    setPreviews(newPreviews);
    setLocalUrls(updatedLocalUrls);
    onFilesChange(updatedFiles);
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = previews[indexToRemove];

    if (localUrls.includes(urlToRemove)) {
      URL.revokeObjectURL(urlToRemove);
      setLocalUrls(localUrls.filter(url => url !== urlToRemove));
    }
    
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFilesChange(updatedFiles);
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const newFiles = [...files];
    const draggedFile = newFiles.splice(dragItem.current, 1)[0];
    newFiles.splice(dragOverItem.current, 0, draggedFile);
    setFiles(newFiles);
    onFilesChange(newFiles);

    const newPreviews = [...previews];
    const draggedPreview = newPreviews.splice(dragItem.current, 1)[0];
    newPreviews.splice(dragOverItem.current, 0, draggedPreview);
    setPreviews(newPreviews);

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
        {validPreviews.map((url, index) => {
          // Find the actual index in the original previews array
          const actualIndex = previews.indexOf(url);
          return (
            <div 
              key={`${url}-${index}`} 
              className="relative w-40 h-40 rounded-lg overflow-hidden border cursor-grab"
              draggable
              onDragStart={(e) => handleDragStart(e, actualIndex)}
              onDragEnter={(e) => handleDragEnter(e, actualIndex)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <Image 
                src={url} 
                alt={`Preview ${index}`}
                width={160}
                height={120}
                className="rounded-lg border object-contain bg-gray-100"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(actualIndex)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                aria-label="Xóa hình ảnh"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {(!isMultiple && validPreviews.length === 0) || isMultiple ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-lg text-gray-500 transition hover:border-blue-600 hover:text-blue-600`}
          >
            <CloudArrowUpIcon className="h-8 w-8" />
            <span className="mt-2 text-sm">
               Chọn hình ảnh
            </span>
          </button>
        ) : null}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        name={name}
        multiple={isMultiple}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}