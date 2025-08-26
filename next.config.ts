import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https' ,
        hostname: 'images.unsplash.com',
      },
    ],
    // Thêm vào đây để cho phép Next.js sử dụng định dạng AVIF và WebP
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;