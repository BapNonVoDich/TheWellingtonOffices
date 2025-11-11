import { generateMetadata as generateSEOMetadata, generateLocalBusinessSchema } from '@/lib/seo';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Liên hệ với chúng tôi',
  description: 'Liên hệ với The Wellington Offices để được tư vấn về văn phòng cho thuê. Hotline: 097 1777213, Email: thewellingtonoffice@gmail.com',
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com'}/lien-he`,
  keywords: ['liên hệ', 'tư vấn văn phòng', 'contact', 'hotline'],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {children}
    </>
  );
}

