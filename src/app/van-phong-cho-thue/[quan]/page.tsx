// src/app/van-phong-cho-thue/[quan]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils';
import type { Metadata } from 'next';

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
type Props = { params: { quan: string } };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const allDistricts = await prisma.district.findMany();
  const currentDistrict = allDistricts.find(d => slugify(d.name) === params.quan);
  const districtName = currentDistrict?.name || 'Khu vực';

  return {
    title: `Văn phòng cho thuê tại ${districtName} | The Wellington Offices`,
    description: `Tìm kiếm và thuê văn phòng tốt nhất tại ${districtName}.`,
  };
}

// Component chính để render trang
export default async function DistrictPage({ params }: { params: { quan: string } }) {
    const allDistricts = await prisma.district.findMany({
        include: { 
            wards: { 
                include: { 
                    properties: { 
                        include: { 
                            offices: { where: { isAvailable: true } }, 
                            ward: true 
                        } 
                    } 
                } 
            } 
        }
    });
    const currentDistrict = allDistricts.find(d => slugify(d.name) === params.quan);
    
    if (!currentDistrict) {
        notFound();
    }
    
    const properties = currentDistrict.wards.flatMap(ward => ward.properties);
    const districtName = currentDistrict.name;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Văn phòng cho thuê tại <span className="text-blue-600">{districtName}</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">Khám phá các lựa chọn không gian làm việc tốt nhất tại khu vực {districtName}.</p>
            
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
                                  alt={property.name}
                                  fill={true}
                                  style={{objectFit: 'cover'}}
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-500">Không có hình ảnh</span></div>}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                              <h2 className="text-xl font-semibold truncate" title={property.name}>{property.name}</h2>
                              <p className="text-gray-500 text-sm mt-1 truncate" title={property.ward?.name}>
                                {property.ward?.name}
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
    )
}