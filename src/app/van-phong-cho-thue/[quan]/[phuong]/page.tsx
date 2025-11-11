// src/app/van-phong-cho-thue/[quan]/[phuong]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils';
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import Script from 'next/script';

// Hàm này sẽ chạy lúc build, lấy tất cả các oldWards và tạo ra các trang tĩnh
export async function generateStaticParams() {
  const oldWards = await prisma.oldWard.findMany({ include: { district: true } });
  
  return oldWards.map((oldWard) => ({
    quan: slugify(oldWard.district.name),
    phuong: slugify(oldWard.name),
  }));
}

// Hàm này tạo Title và Description động cho SEO
type Props = { params: Promise<{ quan: string, phuong: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { quan, phuong } = await params;
  const allOldWards = await prisma.oldWard.findMany({ include: { district: true } });
  const currentOldWard = allOldWards.find(w => slugify(w.district.name) === quan && slugify(w.name) === phuong);
  const oldWardName = currentOldWard?.name || 'Khu vực';
  const districtName = currentOldWard?.district.name || '';

  return generateSEOMetadata({
    title: `Văn phòng cho thuê tại ${oldWardName}, ${districtName} (Địa chỉ cũ)`,
    description: `Tìm kiếm và thuê văn phòng tốt nhất tại ${oldWardName}, ${districtName} (địa chỉ cũ). Khám phá các tòa nhà văn phòng với đầy đủ tiện ích và vị trí đắc địa.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com'}/van-phong-cho-thue/${quan}/${phuong}`,
    keywords: [`văn phòng ${oldWardName}`, `cho thuê ${oldWardName} ${districtName}`, `văn phòng cho thuê ${oldWardName}`, `địa chỉ cũ`],
  });
}

// Component chính để render trang - Route này dùng cho OldWard (địa chỉ cũ)
export default async function OldWardPage({ params }: { params: Promise<{ quan: string, phuong: string }> }) {
    const { quan, phuong } = await params;
    const allOldWards = await prisma.oldWard.findMany({
        include: { 
            district: true, 
            properties: { 
                include: { 
                    offices: { where: { isAvailable: true } }, 
                    oldWard: true,
                    ward: true
                } 
            } 
        }
    });
    const currentOldWard = allOldWards.find(w => slugify(w.district.name) === quan && slugify(w.name) === phuong);

    if (!currentOldWard) {
        notFound();
    }
    
    const properties = currentOldWard.properties;
    const oldWardName = currentOldWard.name;
    const districtName = currentOldWard.district.name;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Trang chủ', url: baseUrl },
      { name: 'Tìm tòa nhà', url: `${baseUrl}/tim-toa-nha` },
      { name: districtName, url: `${baseUrl}/van-phong-cho-thue/${quan}` },
      { name: `${oldWardName} (Địa chỉ cũ)`, url: `${baseUrl}/van-phong-cho-thue/${quan}/${phuong}` },
    ]);

    return (
      <>
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Văn phòng cho thuê tại <span className="text-blue-600">{`${oldWardName}, ${districtName}`}</span>
                <span className="text-sm text-gray-500 ml-2">(Địa chỉ cũ)</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">Tổng hợp các tòa nhà văn phòng tốt nhất tại khu vực này (theo địa chỉ cũ).</p>
            
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Về khu vực {oldWardName}, {districtName}</h2>
              <p className="text-gray-700 mb-4">
                {oldWardName} là một khu vực phát triển mạnh tại {districtName}, thu hút nhiều doanh nghiệp và công ty tìm kiếm không gian văn phòng chất lượng cao. 
                Khu vực này được biết đến với hệ thống giao thông thuận tiện, cơ sở hạ tầng hiện đại và môi trường kinh doanh năng động.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lợi ích khi thuê văn phòng tại đây:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Vị trí đắc địa, dễ dàng tiếp cận</li>
                    <li>Hệ thống giao thông công cộng thuận tiện</li>
                    <li>Nhiều tiện ích xung quanh (nhà hàng, ngân hàng, trường học)</li>
                    <li>Môi trường làm việc chuyên nghiệp</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Thông tin hữu ích:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Đa dạng diện tích từ nhỏ đến lớn</li>
                    <li>Nhiều mức giá phù hợp với ngân sách</li>
                    <li>Hỗ trợ tư vấn miễn phí 24/7</li>
                    <li>Quy trình cho thuê minh bạch, nhanh chóng</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
                {properties.length === 0 ? (
                    <p className="text-center text-gray-500 py-16">Hiện chưa có dữ liệu văn phòng cho khu vực này.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {properties.map((property) => (
                        <Link href={`/property/${property.slug}`} key={property.id}>
                          <div className="border rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                            <div className="relative w-full h-48">
                              {property.imageUrls && property.imageUrls.length > 0 ? (
                                <Image
                                  src={property.imageUrls[0]}
                                  alt={`Văn phòng cho thuê ${property.name} tại ${oldWardName}, ${districtName}`}
                                  fill={true}
                                  style={{objectFit: 'cover'}}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-500">Không có hình ảnh</span></div>}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                              <h2 className="text-xl font-semibold truncate" title={property.name}>{property.name}</h2>
                              <p className="text-gray-500 text-sm mt-1 truncate" title={property.oldWard?.name}>
                                {property.oldWard?.name} {property.ward && `→ ${property.ward.name}`}
                              </p>
                              <div className="mt-4 pt-2 border-t border-gray-200 flex-grow flex items-end">
                                <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full inline-block">
                                  {property.offices.length} văn phòng trống
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                )}
            </div>
        </div>
      </>
    )
}