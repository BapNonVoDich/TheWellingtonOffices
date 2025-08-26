// src/app/tim-van-phong/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import OfficeSearchBar from '../components/OfficeSearchBar';
import { Prisma, Grade, OfficeType } from '@prisma/client';

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

export default async function SearchOfficePage({ searchParams }: SearchOfficePageProps) {
    const { districtId, minArea, maxArea, minPrice, maxPrice, grade, type } = await searchParams;

    const where: Prisma.OfficeWhereInput = { isAvailable: true };

    // === SUA LOI LOGIC O DAY ===
    // Ap dung bo loc vi tri vao Property cha
    if (districtId) {
        where.property = {
            ward: {
                districtId: districtId,
            }
        };
    }

    // Xay dung bo loc dien tich mot cach an toan
    const areaFilter: { gte?: number; lte?: number } = {};
    const minAreaNum = parseInt(minArea || '');
    const maxAreaNum = parseInt(maxArea || '');
    if (!isNaN(minAreaNum)) areaFilter.gte = minAreaNum;
    if (!isNaN(maxAreaNum)) areaFilter.lte = maxAreaNum;

    if (Object.keys(areaFilter).length > 0) {
        where.area = areaFilter;
    }

    // Xay dung bo loc gia mot cach an toan
    const priceFilter: { gte?: number; lte?: number } = {};
    const minPriceNum = parseFloat(minPrice || '');
    const maxPriceNum = parseFloat(maxPrice || '');
    if (!isNaN(minPriceNum)) priceFilter.gte = minPriceNum;
    if (!isNaN(maxPriceNum)) priceFilter.lte = maxPriceNum;
    
    if (Object.keys(priceFilter).length > 0) {
        where.price_per_sqm = priceFilter;
    }

    // THEM LOGIC LOC MOI
    if (grade && Object.values(Grade).includes(grade as Grade)) {
        where.grade = grade as Grade;
    }
    if (type && Object.values(OfficeType).includes(type as OfficeType)) {
        where.type = type as OfficeType;
    }
    
    const offices = await prisma.office.findMany({
        where: where,
        include: { 
            property: { 
                include: { 
                    ward: {
                        include: {
                            district: true
                        }
                    } 
                } 
            } 
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tìm kiếm Văn phòng</h1>
            <p className="mt-2 text-gray-600">Sử dụng bộ lọc để tìm văn phòng phù hợp với nhu cầu của bạn.</p>
            <div className="mt-8">
                <OfficeSearchBar />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 my-8">
                Kết quả tìm kiếm ({offices.length})
            </h2>

            {offices.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">Không có văn phòng nào phù hợp.</p>
            ) : (
                <div className="space-y-6">
                  {offices.map((office) => (
                    <Link href={`/property/${office.propertyId}`} key={office.id}>
                      <div className="bg-white border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row overflow-hidden">
                        <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                          {office.property.imageUrls[0] ? (
                            <Image
                              src={office.property.imageUrls[0]}
                              alt={office.property.name}
                              fill={true}
                              style={{objectFit: 'cover'}}
                              className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                            />
                          ) : <div className="w-full h-full bg-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-t-none"></div>}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-semibold">{office.property.name}</p>
                            <h3 className="text-lg font-bold mt-1">Văn phòng {office.area} m², Tầng {office.floor || '?'}</h3>
                            <p className="text-sm text-gray-500 mt-1">{office.property.address_line}, {office.property.ward?.name}, {office.property.ward?.district.name}</p>
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
                  ))}
                </div>
            )}
        </div>
    )
}