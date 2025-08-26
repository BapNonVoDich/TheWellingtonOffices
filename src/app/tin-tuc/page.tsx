// src/app/tin-tuc/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tin tức & Phân tích thị trường | The Wellington Offices',
  description: 'Cập nhật những tin tức mới nhất về thị trường văn phòng cho thuê và các phân tích chuyên sâu.',
};

export default async function NewsListPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  });

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Tin tức & Phân tích</h1>
        <p className="mt-4 text-lg text-gray-600">Cập nhật các xu hướng mới nhất của thị trường văn phòng cho thuê.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link href={`/tin-tuc/${post.slug}`} key={post.id}>
            <div className="border rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-48">
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600">{post.title}</h2>
                <div className="mt-3 text-sm text-gray-500">
                  <span>Viết bởi {post.author.name}</span>
                  <span className="mx-1">&middot;</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {/* Chúng ta có thể thêm một đoạn tóm tắt ngắn ở đây sau */}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}