import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https' ,
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Thêm vào đây để cho phép Next.js sử dụng định dạng AVIF và WebP
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // Tăng giới hạn kích thước payload lên 5MB
    },
  },
};

export default nextConfig;