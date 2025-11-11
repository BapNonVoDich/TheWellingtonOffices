// src/app/property/[slug]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import type { PropertyWithDetails } from '@/types';
import ImageGallery from './ImageGallery';
import Image from 'next/image';
import Link from 'next/link';
import { generateMetadata as generateSEOMetadata, generatePropertySchema, generateBreadcrumbSchema } from '@/lib/seo';
import type { Metadata } from 'next';
import Script from 'next/script';
import { slugify } from '@/lib/utils';

// generateStaticParams để tạo các trang tĩnh khi build
export async function generateStaticParams() {
  const properties = await prisma.property.findMany({
    select: { slug: true },
  });
 
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
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
  });

  if (!property) {
    return {
      title: 'Không tìm thấy tòa nhà',
    };
  }

  const ward = property.ward || property.oldWard;
  const location = ward ? `${ward.name}, ${ward.district?.name || ''}` : property.address_line;
  const amenitiesText = property.amenities.length > 0 ? ` Tiện ích: ${property.amenities.slice(0, 3).join(', ')}.` : '';
  const description = `Văn phòng cho thuê tại ${property.name}, ${location}.${amenitiesText} Xem chi tiết và liên hệ ngay!`;

  return generateSEOMetadata({
    title: `${property.name} - Văn phòng cho thuê`,
    description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com'}/property/${property.slug}`,
    image: property.imageUrls?.[0],
    keywords: [
      property.name,
      `văn phòng ${property.ward?.district?.name || ''}`,
      `cho thuê ${property.ward?.name || ''}`,
      'văn phòng cho thuê',
      'office rental',
    ],
  });
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
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
      },
      oldWard: {
        include: {
          district: true,
        }
      }
    },
  });

  // Fetch related properties (same district, excluding current property)
  const relatedProperties = property ? await prisma.property.findMany({
    where: {
      id: { not: property.id },
      OR: [
        property.ward ? { wardId: property.ward.id } : {},
        property.oldWard ? { oldWardId: property.oldWard.id } : {},
        property.ward?.district ? { ward: { districtId: property.ward.district.id } } : {},
        property.oldWard?.district ? { oldWard: { districtId: property.oldWard.district.id } } : {},
      ].filter(condition => Object.keys(condition).length > 0),
    },
    take: 6,
    include: {
      offices: { where: { isAvailable: true } },
      ward: { include: { district: true } },
      oldWard: { include: { district: true } },
    },
  }) : [];

  if (!property) {
    notFound();
  }

  const propertySchema = generatePropertySchema({
    name: property.name,
    slug: property.slug,
    address_line: property.address_line,
    imageUrls: property.imageUrls,
    description: property.description || undefined,
    latitude: property.latitude,
    longitude: property.longitude,
    amenities: property.amenities,
    ward: property.ward ? {
      name: property.ward.name,
      district: property.ward.district ? { name: property.ward.district.name } : undefined,
    } : undefined,
    oldWard: property.oldWard ? {
      name: property.oldWard.name,
      district: property.oldWard.district ? { name: property.oldWard.district.name } : undefined,
    } : undefined,
    offices: property.offices,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Tìm tòa nhà', url: `${baseUrl}/tim-toa-nha` },
    ...(property.ward?.district ? [{ name: property.ward.district.name, url: `${baseUrl}/van-phong-cho-thue/${slugify(property.ward.district.name)}` }] : []),
    { name: property.name, url: `${baseUrl}/property/${property.slug}` },
  ]);

  return (
    <>
      <Script
        id="property-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <ImageGallery 
              images={property.imageUrls} 
              propertyName={property.name}
              location={property.ward ? `${property.ward.name}, ${property.ward.district?.name || ''}` : property.oldWard ? `${property.oldWard.name}, ${property.oldWard.district?.name || ''}` : undefined}
            />
            <div className="flex flex-col h-full">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{property.name}</h1>
              <p className="text-lg text-gray-600 mt-2">
                {property.address_line}
                {property.ward && `, ${property.ward.name}, ${property.ward.district?.name}`}
                {property.oldWard && (
                  <span className="text-sm text-gray-500 block mt-1">
                    (Địa chỉ cũ: {property.oldWard.name}, {property.oldWard.district?.name})
                  </span>
                )}
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

        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Tòa nhà liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProperties.map((relatedProperty) => (
                <Link href={`/property/${relatedProperty.slug}`} key={relatedProperty.id}>
                  <div className="border rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <div className="relative w-full h-48">
                      {relatedProperty.imageUrls && relatedProperty.imageUrls.length > 0 ? (
                        <Image
                          src={relatedProperty.imageUrls[0]}
                          alt={`Văn phòng cho thuê ${relatedProperty.name} tại ${relatedProperty.ward?.name || relatedProperty.oldWard?.name || ''}, ${relatedProperty.ward?.district?.name || relatedProperty.oldWard?.district?.name || ''}`}
                          fill={true}
                          style={{objectFit: 'cover'}}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">Không có hình ảnh</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold truncate" title={relatedProperty.name}>
                        {relatedProperty.name}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 truncate">
                        {relatedProperty.ward?.name || relatedProperty.oldWard?.name}
                        {relatedProperty.ward?.district && `, ${relatedProperty.ward.district.name}`}
                        {relatedProperty.oldWard?.district && `, ${relatedProperty.oldWard.district.name}`}
                      </p>
                      <div className="mt-4 pt-2 border-t border-gray-200 flex-grow flex items-end">
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                          {relatedProperty.offices.length} văn phòng trống
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}