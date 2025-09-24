// src/app/tin-tuc/[slug]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';

type Props = { params: { slug: string } };

// Ham nay tao Title va Description dong cho SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // Thêm await
  const post = await prisma.post.findUnique({
    where: { slug: slug },
  });

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết'
    }
  }

  return {
    title: `${post.title} | The Wellington Offices`,
    description: post.content.substring(0, 160), // Lấy 160 ký tự đầu làm description
  };
}
export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params; // Thêm await
  const post = await prisma.post.findUnique({
    where: { slug: slug, published: true },
    include: { author: true },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 text-sm text-gray-500">
            <span>Viết bởi {post.author.name}</span>
            <span className="mx-2">&middot;</span>
            <span>Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </header>

        {post.imageUrl && (
          <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}

        {/* Sử dụng class 'prose' và dangerouslySetInnerHTML để render HTML */}
        <div
          className="prose lg:prose-xl max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );


}