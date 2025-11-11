// src/app/van-phong-cho-thue/dia-chi-moi/[phuong]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils';
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import Script from 'next/script';

// Hàm này sẽ chạy lúc build, lấy tất cả các wards và tạo ra các trang tĩnh
export async function generateStaticParams() {
  const wards = await prisma.ward.findMany({ include: { district: true } });
  
  return wards.map((ward) => ({
    phuong: slugify(ward.name),
  }));
}

// Hàm này tạo Title và Description động cho SEO
type Props = { params: Promise<{ phuong: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { phuong } = await params;
  const allWards = await prisma.ward.findMany({ include: { district: true } });
  const matchingWards = allWards.filter(w => slugify(w.name) === phuong);
  
  // Nếu có nhiều wards cùng tên, lấy ward đầu tiên
  const currentWard = matchingWards[0];
  const wardName = currentWard?.name || 'Khu vực';
  const districtName = currentWard?.district.name || '';

  return generateSEOMetadata({
    title: `Văn phòng cho thuê tại ${wardName}${matchingWards.length > 1 ? ` (${matchingWards.length} quận)` : ''} (Địa chỉ mới)`,
    description: `Tìm kiếm và thuê văn phòng tốt nhất tại ${wardName}${matchingWards.length > 1 ? ` (có tại ${matchingWards.length} quận)` : `, ${districtName}`} (địa chỉ mới). Khám phá các tòa nhà văn phòng với đầy đủ tiện ích và vị trí đắc địa.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com'}/van-phong-cho-thue/dia-chi-moi/${phuong}`,
    keywords: [`văn phòng ${wardName}`, `cho thuê ${wardName}`, `văn phòng cho thuê ${wardName}`, `địa chỉ mới`],
  });
}

// Component chính để render trang
export default async function WardPage({ params }: { params: Promise<{ phuong: string }> }) {
    const { phuong } = await params;
    const allWards = await prisma.ward.findMany({
        include: { 
            district: true, 
            properties: { 
                include: { 
                    offices: { where: { isAvailable: true } }, 
                    ward: {
                        include: {
                            district: true,
                        }
                    },
                    oldWard: {
                        include: {
                            district: true,
                        }
                    }
                } 
            } 
        }
    });
    
    // Tìm tất cả wards có cùng slug phuong
    const matchingWards = allWards.filter(w => slugify(w.name) === phuong);

    if (matchingWards.length === 0) {
        notFound();
    }
    
    // Lấy tất cả properties từ các wards khớp
    const properties = matchingWards.flatMap(ward => ward.properties);
    const wardName = matchingWards[0].name;
    const districts = [...new Set(matchingWards.map(w => w.district.name))];

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Trang chủ', url: baseUrl },
      { name: 'Tìm tòa nhà', url: `${baseUrl}/tim-toa-nha` },
      { name: `${wardName} (Địa chỉ mới)`, url: `${baseUrl}/van-phong-cho-thue/dia-chi-moi/${phuong}` },
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
                Văn phòng cho thuê tại <span className="text-blue-600">{wardName}</span>
                {districts.length > 1 && (
                  <span className="text-lg text-gray-600 ml-2">({districts.join(', ')})</span>
                )}
                <span className="text-sm text-gray-500 ml-2">(Địa chỉ mới)</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Tổng hợp các tòa nhà văn phòng tốt nhất tại {wardName}
              {districts.length > 1 ? ` (có tại ${districts.length} quận: ${districts.join(', ')})` : `, ${districts[0]}`} (theo địa chỉ mới).
            </p>
            
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Về khu vực {wardName}</h2>
              <p className="text-gray-700 mb-4">
                {wardName} là một trong những khu vực phát triển năng động nhất tại {districts.length > 1 ? `các quận ${districts.join(', ')}` : `quận ${districts[0]}`}, 
                nơi tập trung nhiều tòa nhà văn phòng hiện đại và chuyên nghiệp. Khu vực này mang đến cơ hội tuyệt vời cho các doanh nghiệp 
                muốn tìm kiếm không gian làm việc chất lượng với vị trí chiến lược.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ưu điểm nổi bật:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Vị trí trung tâm, dễ dàng di chuyển</li>
                    <li>Cơ sở hạ tầng hiện đại và đầy đủ tiện ích</li>
                    <li>Môi trường kinh doanh sôi động</li>
                    <li>Nhiều lựa chọn về diện tích và giá cả</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dịch vụ hỗ trợ:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Tư vấn miễn phí về vị trí và giá cả</li>
                    <li>Hỗ trợ xem văn phòng theo lịch hẹn</li>
                    <li>Thủ tục cho thuê đơn giản, nhanh chóng</li>
                    <li>Chăm sóc khách hàng chuyên nghiệp</li>
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
                                  alt={`Văn phòng cho thuê ${property.name} tại ${wardName}${districts.length > 1 ? ` (${districts.join(', ')})` : `, ${districts[0]}`}`}
                                  fill={true}
                                  style={{objectFit: 'cover'}}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-500">Không có hình ảnh</span></div>}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                              <h2 className="text-xl font-semibold truncate" title={property.name}>{property.name}</h2>
                              <p className="text-gray-500 text-sm mt-1 truncate" title={property.ward?.name}>
                                {property.ward?.name} {property.ward?.district && `, ${property.ward.district.name}`} {property.oldWard && `(từ ${property.oldWard.name})`}
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

