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

// Validation constants (matching server-side)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to validate file
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_MIME_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
    };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File quá lớn. Kích thước tối đa: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }
  
  return { valid: true };
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
  // Track all blob URLs that have been created (for comprehensive cleanup)
  const allBlobUrlsRef = useRef<Set<string>>(new Set());

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

  // Comprehensive cleanup effect - revoke all blob URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup all tracked blob URLs
      allBlobUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          // Silently handle errors (URL might already be revoked)
          console.warn('Failed to revoke blob URL:', url);
        }
      });
      allBlobUrlsRef.current.clear();
    };
  }, []);

  // Cleanup blob URLs that are no longer in use
  useEffect(() => {
    const currentBlobUrls = new Set(
      previews.filter(url => url.startsWith('blob:'))
    );
    
    // Find blob URLs that are no longer in use
    const urlsToRevoke: string[] = [];
    allBlobUrlsRef.current.forEach(url => {
      if (!currentBlobUrls.has(url)) {
        urlsToRevoke.push(url);
      }
    });
    
    // Revoke unused blob URLs
    urlsToRevoke.forEach(url => {
      try {
        URL.revokeObjectURL(url);
        allBlobUrlsRef.current.delete(url);
      } catch (error) {
        console.warn('Failed to revoke blob URL:', url);
      }
    });
  }, [previews]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const fileList = Array.from(event.target.files);
    
    // Validate all files before processing
    const validationErrors: string[] = [];
    const validFiles: File[] = [];
    
    fileList.forEach((file, index) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`File ${index + 1}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    });
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // If no valid files, return early
    if (validFiles.length === 0) return;

    const newFiles = validFiles;
    const newLocalUrls = newFiles.map(file => {
      const blobUrl = URL.createObjectURL(file);
      // Track all created blob URLs
      allBlobUrlsRef.current.add(blobUrl);
      return blobUrl;
    });

    let updatedFiles;
    let newPreviews;
    let updatedLocalUrls;

    if (isMultiple) {
      updatedFiles = [...files, ...newFiles];
      newPreviews = [...previews, ...newLocalUrls];
      updatedLocalUrls = [...localUrls, ...newLocalUrls];
    } else {
      // Revoke old blob URLs when replacing single image
      localUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
          allBlobUrlsRef.current.delete(url);
        } catch (error) {
          console.warn('Failed to revoke blob URL:', url);
        }
      }); 
      updatedFiles = newFiles;
      newPreviews = newLocalUrls;
      updatedLocalUrls = newLocalUrls;
    }
    
    setFiles(updatedFiles);
    setPreviews(newPreviews);
    setLocalUrls(updatedLocalUrls);
    onFilesChange(updatedFiles);
    
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = previews[indexToRemove];

    // Revoke blob URL if it's a local blob URL
    if (urlToRemove.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(urlToRemove);
        allBlobUrlsRef.current.delete(urlToRemove);
      } catch (error) {
        console.warn('Failed to revoke blob URL:', urlToRemove);
      }
    }
    
    // Update state
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    const updatedLocalUrls = localUrls.filter((_, index) => index !== indexToRemove);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    setLocalUrls(updatedLocalUrls);
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