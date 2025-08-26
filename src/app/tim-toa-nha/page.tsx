// src/app/tim-toa-nha/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Prisma, Grade } from '@prisma/client';
import BuildingSearchBar from '../components/BuildingSearchBar';
import PaginationControls from '../components/PaginationControls';

interface SearchBuildingPageProps {
  searchParams: Promise<{
    page?: string;
    districtId?: string;
    wardId?: string;
    grade?: string;
  }>
}

const ITEMS_PER_PAGE = 9;

export default async function SearchBuildingPage({ searchParams }: SearchBuildingPageProps) {
    const { page, wardId, districtId, grade } = await searchParams;
    const currentPage = Number(page) || 1;

    const where: Prisma.PropertyWhereInput = {};

    if (wardId) {
        where.wardId = wardId;
    } else if (districtId) {
        where.ward = { districtId };
    }

    if (grade && Object.values(Grade).includes(grade as Grade)) {
        where.offices = {
            some: {
                grade: grade as Grade,
            }
        };
    }

    const [properties, totalCount] = await prisma.$transaction([
        prisma.property.findMany({
            where,
            include: { 
                ward: true, 
                offices: { where: { isAvailable: true } } 
            },
            orderBy: { createdAt: 'desc' },
            take: ITEMS_PER_PAGE,
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
        }),
        prisma.property.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tìm kiếm Tòa nhà</h1>
            <p className="mt-2 text-gray-600">Sử dụng bộ lọc để tìm tòa nhà phù hợp với bạn.</p>
            <div className="mt-8">
                <BuildingSearchBar />
            </div>
            
            <div className="flex justify-between items-center my-8 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                  Kết quả tìm kiếm
              </h2>
              <p className="text-sm text-gray-600">Tìm thấy {totalCount} kết quả</p>
            </div>


            {properties.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">Không có tòa nhà nào phù hợp.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.map((property) => (
                    <Link href={`/property/${property.id}`} key={property.id}>
                      {/* === PHẦN CODE BỊ THIẾU NẰM Ở ĐÂY === */}
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
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">Không có hình ảnh</span>
                            </div>
                          )}
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
                      {/* ======================================= */}
                    </Link>
                  ))}
                </div>
            )}

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
            />
        </div>
    )
}