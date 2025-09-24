// src/app/van-phong-cho-thue/[quan]/[phuong]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils';
import type { Metadata } from 'next';

// Hàm này sẽ chạy lúc build, lấy tất cả các phường và tạo ra các trang tĩnh
export async function generateStaticParams() {
  const wards = await prisma.ward.findMany({ include: { district: true } });
  
  return wards.map((ward) => ({
    quan: slugify(ward.district.name),
    phuong: slugify(ward.name),
  }));
}

// Hàm này tạo Title và Description động cho SEO
type Props = { params: { quan: string, phuong: string } };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const allWards = await prisma.ward.findMany({ include: { district: true } });
  const currentWard = allWards.find(w => slugify(w.district.name) === params.quan && slugify(w.name) === params.phuong);
  const wardName = currentWard?.name || 'Khu vực';
  const districtName = currentWard?.district.name || '';

  return {
    title: `Văn phòng cho thuê tại ${wardName}, ${districtName}`,
    description: `Tìm kiếm và thuê văn phòng tốt nhất tại ${wardName}, ${districtName}.`,
  };
}


// Component chính để render trang
export default async function WardPage({ params }: { params: { quan: string, phuong: string } }) {
    const allWards = await prisma.ward.findMany({
        include: { 
            district: true, 
            properties: { 
                include: { 
                    offices: { where: { isAvailable: true } }, 
                    ward: true 
                } 
            } 
        }
    });
    const currentWard = allWards.find(w => slugify(w.district.name) === params.quan && slugify(w.name) === params.phuong);

    if (!currentWard) {
        notFound();
    }
    
    const properties = currentWard.properties;
    const wardName = currentWard.name;
    const districtName = currentWard.district.name;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Văn phòng cho thuê tại <span className="text-blue-600">{`${wardName}, ${districtName}`}</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">Tổng hợp các tòa nhà văn phòng tốt nhất tại khu vực này.</p>
            
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