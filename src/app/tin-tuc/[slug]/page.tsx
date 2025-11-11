// src/app/tin-tuc/[slug]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { generateMetadata as generateSEOMetadata, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo';
import Script from 'next/script';

type Props = { params: Promise<{ slug: string }> };

// Ham nay tao Title va Description dong cho SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug: slug },
    include: { author: true },
  });

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết'
    }
  }

  // Strip HTML tags for description
  const plainText = post.content.replace(/<[^>]*>/g, '').substring(0, 160);

  return generateSEOMetadata({
    title: post.title,
    description: plainText,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com'}/tin-tuc/${post.slug}`,
    image: post.imageUrl || undefined,
    type: 'article',
    publishedTime: post.createdAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    author: post.author.name,
    keywords: ['tin tức', 'thị trường văn phòng', 'bất động sản', 'news'],
  });
}
export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug: slug, published: true },
    include: { author: true },
  });

  if (!post) {
    notFound();
  }

  const articleSchema = generateArticleSchema(post);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Tin tức', url: `${baseUrl}/tin-tuc` },
    { name: post.title, url: `${baseUrl}/tin-tuc/${post.slug}` },
  ]);

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
    </>
  );


}