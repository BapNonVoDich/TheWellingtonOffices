// src/app/van-phong-cho-thue/[quan]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils';
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import Script from 'next/script';

// Hàm này sẽ chạy lúc build, lấy tất cả các quận và tạo ra các trang tĩnh
export async function generateStaticParams() {
  const districts = await prisma.district.findMany({
    where: {
        NOT: {
            name: {
                in: ["Tỉnh Bình Dương", "Tỉnh Bà Rịa - Vũng Tàu"]
            }
        }
    }
  });
  return districts.map((district) => ({
    quan: slugify(district.name),
  }));
}

// Hàm này tạo Title và Description động cho SEO
type Props = { params: Promise<{ quan: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { quan } = await params;
  const allDistricts = await prisma.district.findMany();
  const currentDistrict = allDistricts.find(d => slugify(d.name) === quan);
  const districtName = currentDistrict?.name || 'Khu vực';

  return generateSEOMetadata({
    title: `Văn phòng cho thuê tại ${districtName} (Địa chỉ cũ)`,
    description: `Tìm kiếm và thuê văn phòng tốt nhất tại ${districtName} (địa chỉ cũ). Khám phá các tòa nhà văn phòng với đầy đủ tiện ích và vị trí đắc địa tại ${districtName}.`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com'}/van-phong-cho-thue/${quan}`,
    keywords: [`văn phòng ${districtName}`, `cho thuê ${districtName}`, `văn phòng cho thuê ${districtName}`, `địa chỉ cũ`],
  });
}

// Component chính để render trang - Route này dùng cho OldWard (địa chỉ cũ)
export default async function DistrictPage({ params }: { params: Promise<{ quan: string }> }) {
    const { quan } = await params;
    const allDistricts = await prisma.district.findMany({
        include: { 
            oldWards: { 
                include: { 
                    properties: { 
                        include: { 
                            offices: { where: { isAvailable: true } }, 
                            oldWard: true,
                            ward: true
                        } 
                    } 
                } 
            }
        }
    });
    const currentDistrict = allDistricts.find(d => slugify(d.name) === quan);
    
    if (!currentDistrict) {
        notFound();
    }
    
    const properties = currentDistrict.oldWards.flatMap(oldWard => oldWard.properties);
    const districtName = currentDistrict.name;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Trang chủ', url: baseUrl },
      { name: 'Tìm tòa nhà', url: `${baseUrl}/tim-toa-nha` },
      { name: districtName, url: `${baseUrl}/van-phong-cho-thue/${quan}` },
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
                Văn phòng cho thuê tại <span className="text-blue-600">{districtName}</span>
                <span className="text-sm text-gray-500 ml-2">(Địa chỉ cũ)</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">Khám phá các lựa chọn không gian làm việc tốt nhất tại khu vực {districtName} (theo địa chỉ cũ).</p>
            
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
                                  alt={`Văn phòng cho thuê ${property.name} tại ${districtName}`}
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