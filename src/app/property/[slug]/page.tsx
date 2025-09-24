// src/app/property/[slug]/page.tsx
import prisma from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { PropertyWithDetails } from '@/types';

// generateStaticParams để tạo các trang tĩnh khi build
export async function generateStaticParams() {
  const properties = await prisma.property.findMany({
    select: { slug: true },
  });
 
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const property: PropertyWithDetails | null = await prisma.property.findUnique({
    where: { slug: slug }, // Thay đổi từ id sang slug
    include: {
      offices: {
        where: { isAvailable: true },
        orderBy: { area: 'asc' },
      },
      ward: {
        include: {
          district: true,
        }
      }
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              {property.imageUrls && property.imageUrls.length > 0 ? (
                <Image
                  src={property.imageUrls[0]}
                  alt={property.name}
                  fill={true}
                  style={{objectFit: 'cover'}}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Không có hình ảnh</span>
                </div>
              )}
            </div>
            <div className="flex flex-col h-full">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{property.name}</h1>
              <p className="text-lg text-gray-600 mt-2">
                {property.address_line}, {property.ward?.name}, {property.ward?.district.name}
              </p>
              <div className="mt-6 pt-4 border-t">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Thông tin chi tiết:</h2>
                <dl className="space-y-2 text-gray-700">
                  {property.yearBuilt && <div className="flex"><dt className="w-1/3 font-medium">Năm xây dựng:</dt><dd>{property.yearBuilt}</dd></div>}
                  {property.directions && <div className="flex"><dt className="w-1/3 font-medium">Hướng:</dt><dd>{property.directions}</dd></div>}
                </dl>
              </div>
              <div className="mt-4 pt-4 border-t">
                 <h2 className="text-lg font-semibold text-gray-800 mb-2">Tiện ích:</h2>
                 <div className="flex flex-wrap gap-2">
                  {property.amenities.map(amenity => (
                    <span key={amenity} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">{amenity}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Các văn phòng đang cho thuê</h2>
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="py-3 px-6">Diện tích (m²)</th>
                  <th scope="col" className="py-3 px-6">Giá ($/m²/tháng)</th>
                  <th scope="col" className="py-3 px-6">Tầng</th>
                  <th scope="col" className="py-3 px-6">Loại hình</th>
                </tr>
              </thead>
              <tbody>
                {property.offices.map(office => (
                  <tr key={office.id} className="bg-white border-b hover:bg-gray-100">
                    <td className="py-4 px-6 font-medium text-gray-900">{office.area}</td>
                    <td className="py-4 px-6">{office.price_per_sqm}</td>
                    <td className="py-4 px-6">{office.floor || '-'}</td>
                    <td className="py-4 px-6 capitalize">{office.type.toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}