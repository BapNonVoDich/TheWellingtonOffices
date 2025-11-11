import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Ký gửi bất động sản cho thuê',
  description: 'Ký gửi văn phòng cho thuê với The Wellington Offices. Chúng tôi sẽ giúp bạn tìm kiếm khách hàng phù hợp và quản lý quy trình cho thuê.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com'}/ky-gui`,
  keywords: ['ký gửi văn phòng', 'ký gửi bất động sản', 'cho thuê văn phòng', 'consignment'],
});

export default function KyGuiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

