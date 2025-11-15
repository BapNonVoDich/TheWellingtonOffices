// src/app/tim-van-phong/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import OfficeSearchBar from '../components/OfficeSearchBar';
import { Prisma, Grade, OfficeType } from '@prisma/client';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

interface SearchOfficePageProps {
  searchParams: Promise<{
    districtId?: string;
    minArea?: string;
    maxArea?: string;
    minPrice?: string;
    maxPrice?: string;
    grade?: string; // Them type
    type?: string;  // Them type
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "Tìm kiếm văn phòng cho thuê",
    description: "Tìm kiếm văn phòng cho thuê phù hợp với nhu cầu. Lọc theo diện tích, giá cả, vị trí và hạng văn phòng tại TP.HCM.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com'}/tim-van-phong`,
    keywords: ["tìm văn phòng", "văn phòng cho thuê", "tìm kiếm văn phòng", "office search"],
  });
}

export default async function SearchOfficePage({ searchParams }: SearchOfficePageProps) {
    const { districtId, minArea, maxArea, minPrice, maxPrice, grade, type } = await searchParams;

    // 1) Lay danh sach Property hop le (tranh truong hop quan he bi mo coi trong DB)
    const validProperties = await prisma.property.findMany({
        where: districtId
            ? {
                ward: {
                    districtId: districtId,
                },
            }
            : undefined,
        include: {
            ward: {
                include: { district: true },
            },
        },
    });
    const validPropertyIdSet = new Set(validProperties.map((p) => p.id));
    const validPropertyIds = Array.from(validPropertyIdSet);

    // 2) Xay dung bo loc Office an toan
    const officeWhere: Prisma.OfficeWhereInput = { isAvailable: true };

    // Loc theo Property hop le
    if (validPropertyIds.length > 0) {
        officeWhere.propertyId = { in: validPropertyIds };
    } else if (districtId) {
        // Neu co districtId ma khong co Property nao, tra ve rong som
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tìm kiếm Văn phòng</h1>
                <p className="mt-2 text-gray-600">Sử dụng bộ lọc để tìm văn phòng phù hợp với nhu cầu của bạn.</p>
                <div className="mt-8">
                    <OfficeSearchBar />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 my-8">Kết quả tìm kiếm (0)</h2>
                <p className="text-center text-gray-500 mt-8">Không có văn phòng nào phù hợp.</p>
            </div>
        );
    }

    // Dien tich
    const areaFilter: { gte?: number; lte?: number } = {};
    const minAreaNum = parseInt(minArea || '');
    const maxAreaNum = parseInt(maxArea || '');
    if (!isNaN(minAreaNum)) areaFilter.gte = minAreaNum;
    if (!isNaN(maxAreaNum)) areaFilter.lte = maxAreaNum;
    if (Object.keys(areaFilter).length > 0) {
        officeWhere.area = areaFilter;
    }

    // Gia
    const priceFilter: { gte?: number; lte?: number } = {};
    const minPriceNum = parseFloat(minPrice || '');
    const maxPriceNum = parseFloat(maxPrice || '');
    if (!isNaN(minPriceNum)) priceFilter.gte = minPriceNum;
    if (!isNaN(maxPriceNum)) priceFilter.lte = maxPriceNum;
    if (Object.keys(priceFilter).length > 0) {
        officeWhere.price_per_sqm = priceFilter;
    }

    if (grade && Object.values(Grade).includes(grade as Grade)) {
        officeWhere.grade = grade as Grade;
    }
    if (type && Object.values(OfficeType).includes(type as OfficeType)) {
        officeWhere.type = type as OfficeType;
    }

    // 3) Lay Offices với property để hiển thị đầy đủ thông tin
    const offices = await prisma.office.findMany({
        where: officeWhere,
        orderBy: { createdAt: 'desc' },
        include: {
            property: {
                include: {
                    ward: {
                        include: { district: true },
                    },
                    oldWard: {
                        include: { district: true },
                    },
                },
            },
        },
    });

    // Lọc offices có property hợp lệ (có ward hoặc oldWard)
    const validOffices = offices.filter(office => {
        const property = office.property;
        if (!property) return false;
        
        // Nếu có districtId filter, kiểm tra property có ward với districtId đó
        if (districtId) {
            return property.ward?.districtId === districtId || 
                   property.oldWard?.districtId === districtId;
        }
        
        // Nếu không có districtId filter, chỉ cần có property
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tìm kiếm Văn phòng</h1>
            <p className="mt-2 text-gray-600">Sử dụng bộ lọc để tìm văn phòng phù hợp với nhu cầu của bạn.</p>
            <div className="mt-8">
                <OfficeSearchBar />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 my-8">
                Kết quả tìm kiếm ({validOffices.length})
            </h2>

            {validOffices.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">Không có văn phòng nào phù hợp.</p>
            ) : (
                <div className="space-y-6">
                  {validOffices.map((office) => {
                    const property = office.property;
                    if (!property) return null; // Bo qua office mo coi
                    return (
                    <Link href={`/property/${property.slug}`} key={office.id}>
                      <div className="bg-white border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row overflow-hidden">
                        <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                          {property.imageUrls[0] ? (
                            <Image
                              src={property.imageUrls[0]}
                              alt={`Văn phòng cho thuê ${office.area}m² tại ${property.name}, ${property.ward?.name || ''}, ${property.ward?.district?.name || ''}`}
                              fill={true}
                              style={{objectFit: 'cover'}}
                              className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                            />
                          ) : <div className="w-full h-full bg-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-t-none"></div>}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-semibold">{property.name}</p>
                            <h3 className="text-lg font-bold mt-1">Văn phòng {office.area} m², Tầng {office.floor || '?'}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {property.address_line}, {property.ward?.name || property.oldWard?.name || ''}, {property.ward?.district?.name || property.oldWard?.district?.name || ''}
                            </p>
                          </div>
                          <div className="flex items-end justify-between mt-4">
                            <div>
                                <p className="text-sm text-gray-600">Giá thuê</p>
                                <p className="text-xl font-bold text-red-600">${office.price_per_sqm} <span className="text-sm font-normal text-gray-500">/ m² / tháng</span></p>
                            </div>
                            <span className="text-white bg-blue-500 px-3 py-1 rounded-full text-sm whitespace-nowrap">Xem chi tiết</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    );
                  })}
                </div>
            )}
        </div>
    )
}