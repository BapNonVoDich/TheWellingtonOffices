'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageGalleryProps {
  images: string[];
  propertyName: string;
}

export default function ImageGallery({ images, propertyName }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 text-lg">Không có hình ảnh</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-4">
      {/* Main image with navigation */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden group">
        <Image
          src={images[currentImageIndex]}
          alt={`${propertyName} - Hình ${currentImageIndex + 1}`}
          fill={true}
          style={{objectFit: 'cover'}}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={openModal}
        />
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-70"
              aria-label="Hình trước"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-70"
              aria-label="Hình tiếp theo"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Click to enlarge hint */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Click để xem lớn
        </div>
      </div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((imageUrl, index) => (
            <div 
              key={index} 
              className={`relative w-full h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                index === currentImageIndex ? 'ring-2 ring-blue-500' : 'hover:opacity-80'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={imageUrl}
                alt={`${propertyName} - Thumbnail ${index + 1}`}
                fill={true}
                style={{objectFit: 'cover'}}
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </div>
          ))}
          {images.length > 4 && (
            <div 
              className="relative w-full h-20 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => setCurrentImageIndex(4)}
            >
              <span className="text-gray-500 text-sm font-medium">+{images.length - 4}</span>
            </div>
          )}
        </div>
      )}

      {/* Full-screen modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <Image
              src={images[currentImageIndex]}
              alt={`${propertyName} - Hình ${currentImageIndex + 1}`}
              width={1200}
              height={800}
              style={{objectFit: 'contain'}}
              className="max-w-full max-h-full"
            />
            
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              aria-label="Đóng"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Navigation in modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
                  aria-label="Hình trước"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
                  aria-label="Hình tiếp theo"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image counter in modal */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
