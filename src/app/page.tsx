import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  // Always fetch at SSR so data is ready before hydration
  const properties = await prisma.property.findMany({
    take: 9,
    include: {
      ward: true,
      offices: { where: { isAvailable: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const isEmpty = properties.length === 0;

  return (
    <div>
      {/* HERO - Fixed height prevents CLS */}
      <div className="relative bg-gray-900 h-[400px] sm:h-[500px] lg:h-[600px]">
        {/* Image container */}
        <div className="absolute inset-0">
          <Image
            src="/images/BG.jpg"
            alt="Văn phòng hiện đại"
            width={1920}
            height={1080}
            className="object-cover w-full h-full"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

        {/* Hero text */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl drop-shadow-lg">
            <span className="block">Không Gian Làm Việc Lý Tưởng</span>
            <span className="block text-blue-400 mt-2">
              Dành Cho Doanh Nghiệp Của Bạn
            </span>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-lg text-gray-200 sm:text-xl md:mt-5 md:max-w-3xl drop-shadow-md">
            Khám phá hàng ngàn lựa chọn văn phòng cho thuê tại các vị trí đắc
            địa nhất.
          </p>
        </div>
      </div>

      {/* GRID SECTION - Removed problematic min-h */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Các tòa nhà nổi bật
        </h2>

        {/* Grid container with consistent sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isEmpty
            ? // Skeleton loader with exact same dimensions as real cards
              Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="border rounded-lg shadow-lg overflow-hidden bg-white"
                  style={{ height: '320px' }} // Fixed height to match content
                >
                  <div className="relative w-full h-48 bg-gray-200 animate-pulse" />
                  <div className="p-4 h-32 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            : properties.map((property) => (
                <Link href={`/property/${property.id}`} key={property.id}>
                  <div 
                    className="border rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
                    style={{ height: '320px' }} // Consistent height
                  >
                    {/* Fixed aspect ratio image container with reserved space */}
                    <div className="relative w-full h-48 bg-gray-200">
                      {property.imageUrls?.length > 0 ? (
                        <Image
                          src={property.imageUrls[0]}
                          alt={property.name}
                          width={400}
                          height={300}
                          className="object-cover w-full h-full"
                          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Không có hình ảnh</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content area with fixed height */}
                    <div className="p-4 h-32 flex flex-col justify-between">
                      <div>
                        <h2
                          className="text-xl font-semibold truncate"
                          title={property.name}
                        >
                          {property.name}
                        </h2>
                        <p
                          className="text-gray-500 text-sm mt-1 truncate"
                          title={property.ward?.name}
                        >
                          {property.ward?.name}
                        </p>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200">
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                          {property.offices.length} văn phòng trống
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}