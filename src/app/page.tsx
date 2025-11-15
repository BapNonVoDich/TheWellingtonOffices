import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from "@/lib/seo";
import { getSiteContent, type SiteContentMetadata, type HomeSection } from "@/app/actions/siteContentActions";
import type { Metadata } from "next";
import Script from "next/script";

// Yêu cầu Next.js build lại trang này mỗi 3600 giây (1 giờ)
export const revalidate = 3600;

export const metadata: Metadata = generateSEOMetadata({
  title: "The Wellington Offices - Tìm kiếm và cho thuê văn phòng chuyên nghiệp",
  description: "Khám phá hàng ngàn lựa chọn văn phòng cho thuê tại các vị trí đắc địa nhất Việt Nam. Tìm văn phòng phù hợp với nhu cầu doanh nghiệp của bạn.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://thewellingtonoffices.com",
  image: "/images/BG.jpg",
  keywords: ["văn phòng cho thuê", "cho thuê văn phòng", "văn phòng quận 1", "văn phòng tphcm", "office rental", "co-working space"],
}); 
export default async function HomePage() {
  // Fetch home content from database
  const homeContent = await getSiteContent('home');
  
  // Get sections from metadata
  let sections: HomeSection[] = [];
  let featuredPropertyIds: string[] = [];
  let featuredPostIds: string[] = [];
  
  if (homeContent?.metadata) {
    try {
      const metadata: SiteContentMetadata = JSON.parse(homeContent.metadata);
      
      if (metadata.sections && Array.isArray(metadata.sections)) {
        // Use new sections system
        sections = metadata.sections.sort((a, b) => a.order - b.order);
      } else {
        // Fallback to old system for backward compatibility
        featuredPropertyIds = metadata.featuredProperties || [];
        featuredPostIds = metadata.featuredPosts || [];
      }
    } catch (e) {
      // If parsing fails, use empty arrays
    }
  }

  // Fetch all properties and posts for sections
  const allPropertiesMap = new Map();
  const allPostsMap = new Map();
  let defaultProperties: Array<{ id: string; [key: string]: unknown }> = [];
  let defaultPosts: Array<{ id: string; [key: string]: unknown }> = [];

  if (sections.length > 0) {
    // Collect all IDs from sections
    const allPropertyIds = new Set<string>();
    const allPostIds = new Set<string>();
    let hasEmptyPropertySection = false;
    let hasEmptyPostSection = false;
    
    sections.forEach((section) => {
      if (section.type === 'property') {
        if (section.itemIds.length === 0) {
          hasEmptyPropertySection = true;
        } else {
          section.itemIds.forEach((id) => allPropertyIds.add(id));
        }
      } else if (section.type === 'post') {
        if (section.itemIds.length === 0) {
          hasEmptyPostSection = true;
        } else {
          section.itemIds.forEach((id) => allPostIds.add(id));
        }
      }
      // HTML sections don't need to fetch items
    });

    // Fetch all needed properties
    if (allPropertyIds.size > 0) {
      const properties = await prisma.property.findMany({
        where: { id: { in: Array.from(allPropertyIds) } },
        include: {
          ward: { include: { district: true } },
          oldWard: { include: { district: true } },
          offices: { where: { isAvailable: true } },
        },
      });
      properties.forEach((p) => allPropertiesMap.set(p.id, p));
    }

    // Fetch default properties if any section needs them
    if (hasEmptyPropertySection) {
      defaultProperties = await prisma.property.findMany({
        take: 9,
        include: {
          ward: { include: { district: true } },
          oldWard: { include: { district: true } },
          offices: { where: { isAvailable: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Fetch all needed posts
    if (allPostIds.size > 0) {
      const posts = await prisma.post.findMany({
        where: {
          id: { in: Array.from(allPostIds) },
          published: true,
        },
        include: { author: true },
      });
      posts.forEach((p) => allPostsMap.set(p.id, p));
    }

    // Fetch default posts if any section needs them
    if (hasEmptyPostSection) {
      defaultPosts = await prisma.post.findMany({
        where: { published: true },
        include: { author: true },
        take: 6,
        orderBy: { createdAt: 'desc' },
      });
    }
  } else {
    // Fallback: Fetch properties - use featured if available, otherwise fallback to latest 9
    let properties;
    if (featuredPropertyIds.length > 0) {
      properties = await prisma.property.findMany({
        where: { id: { in: featuredPropertyIds } },
        include: {
          ward: { include: { district: true } },
          oldWard: { include: { district: true } },
          offices: { where: { isAvailable: true } },
        },
      });
      // Sort by featured order
      properties = properties.sort((a, b) => {
        const indexA = featuredPropertyIds.indexOf(a.id);
        const indexB = featuredPropertyIds.indexOf(b.id);
        return indexA - indexB;
      });
    } else {
      properties = await prisma.property.findMany({
        take: 9,
        include: {
          ward: { include: { district: true } },
          oldWard: { include: { district: true } },
          offices: { where: { isAvailable: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    allPropertiesMap.set('fallback', properties);
  }

  // Fetch featured posts if any (for backward compatibility)
  let featuredPosts: Array<{ id: string; title: string; slug: string; content: string; imageUrl: string | null; published: boolean; authorId: string; createdAt: Date; updatedAt: Date; author?: { id: string; name: string; email: string } }> = [];
  if (featuredPostIds.length > 0 && sections.length === 0) {
    featuredPosts = await prisma.post.findMany({
      where: { 
        id: { in: featuredPostIds },
        published: true,
      },
      include: { author: true },
    });
    // Sort by featured order
    featuredPosts = featuredPosts.sort((a, b) => {
      const indexA = featuredPostIds.indexOf(a.id);
      const indexB = featuredPostIds.indexOf(b.id);
      return indexA - indexB;
    });
  }

  const organizationSchema = generateOrganizationSchema();

  // Helper function to render a section
  const renderSection = (section: HomeSection) => {
    // Nếu là HTML section, render HTML trực tiếp
    if (section.type === 'html' && section.content) {
      return (
        <div key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {section.title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {section.title}
            </h2>
          )}
          <div dangerouslySetInnerHTML={{ __html: section.content }} />
        </div>
      );
    }

    if (section.type === 'property') {
      let sectionProperties = section.itemIds
        .map((id) => allPropertiesMap.get(id))
        .filter(Boolean)
        .sort((a, b) => {
          const indexA = section.itemIds.indexOf(a.id);
          const indexB = section.itemIds.indexOf(b.id);
          return indexA - indexB;
        });

      // If no items selected, use default (latest 9 properties)
      if (sectionProperties.length === 0 && defaultProperties.length > 0) {
        sectionProperties = defaultProperties;
      }

      if (sectionProperties.length === 0) return null;

      return (
        <div key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sectionProperties.map((property) => (
              <Link href={`/property/${property.slug}`} key={property.id}>
                <div 
                  className="border rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
                  style={{ height: '320px' }}
                >
                  <div className="relative w-full h-48 bg-gray-200">
                    {property.imageUrls?.length > 0 ? (
                      <Image
                        src={property.imageUrls[0]}
                        alt={`Văn phòng cho thuê ${property.name} tại ${property.ward?.name || property.oldWard?.name || ''}, ${property.ward?.district?.name || property.oldWard?.district?.name || ''}`}
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
                        title={property.ward?.name || property.oldWard?.name}
                      >
                        {property.ward?.name || property.oldWard?.name}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {property.offices?.length || 0} văn phòng trống
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    } else {
      // Post section
      let sectionPosts = section.itemIds
        .map((id) => allPostsMap.get(id))
        .filter(Boolean)
        .sort((a, b) => {
          const indexA = section.itemIds.indexOf(a.id);
          const indexB = section.itemIds.indexOf(b.id);
          return indexA - indexB;
        });

      // If no items selected, use default (latest 6 published posts)
      if (sectionPosts.length === 0 && defaultPosts.length > 0) {
        sectionPosts = defaultPosts;
      }

      if (sectionPosts.length === 0) return null;

      return (
        <div key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sectionPosts.map((post) => (
              <Link href={`/tin-tuc/${post.slug}`} key={post.id}>
                <div className="border rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                  <div className="relative w-full h-48">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={`${post.title} - Tin tức văn phòng cho thuê`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200"></div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600">{post.title}</h2>
                    <div className="mt-3 text-sm text-gray-500">
                      <span>Viết bởi {post.author?.name || 'Unknown'}</span>
                      <span className="mx-1">&middot;</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    }
  };

  // Render sections if available
  const renderSections = () => {
    if (sections.length > 0) {
      return sections.map((section) => renderSection(section));
    }
    
    // Fallback to old system
    const fallbackProperties = allPropertiesMap.get('fallback') || [];
    const isEmpty = fallbackProperties.length === 0;
    
    return (
      <>
        {/* FEATURED POSTS SECTION (backward compatibility) */}
        {featuredPosts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Tin tức nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link href={`/tin-tuc/${post.slug}`} key={post.id}>
                  <div className="border rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                    <div className="relative w-full h-48">
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={`${post.title} - Tin tức văn phòng cho thuê`}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600">{post.title}</h2>
                      <div className="mt-3 text-sm text-gray-500">
                        <span>Viết bởi {post.author?.name || 'Unknown'}</span>
                        <span className="mx-1">&middot;</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* GRID SECTION (backward compatibility) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Các tòa nhà nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isEmpty
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-lg shadow-lg overflow-hidden bg-white"
                    style={{ height: '320px' }}
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
              : fallbackProperties.map((property: { id: string; slug: string; name: string; imageUrls: string[]; address_line: string; ward?: { name: string; district?: { name: string } } | null; oldWard?: { name: string; district?: { name: string } } | null; offices?: Array<{ area: number; price_per_sqm: number }> }) => (
                  <Link href={`/property/${property.slug}`} key={property.id}>
                    <div 
                      className="border rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
                      style={{ height: '320px' }}
                    >
                      <div className="relative w-full h-48 bg-gray-200">
                        {property.imageUrls?.length > 0 ? (
                          <Image
                            src={property.imageUrls[0]}
                            alt={`Văn phòng cho thuê ${property.name} tại ${property.ward?.name || property.oldWard?.name || ''}, ${property.ward?.district?.name || property.oldWard?.district?.name || ''}`}
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
                            title={property.ward?.name || property.oldWard?.name}
                          >
                            {property.ward?.name || property.oldWard?.name}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {property.offices?.length || 0} văn phòng trống
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </>
    );
  };

  // Nếu có HTML content, render nó
  if (homeContent?.content) {
    return (
      <>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <div dangerouslySetInnerHTML={{ __html: homeContent.content }} />
        {renderSections()}
      </>
    );
  }
  
  // Fallback về code hiện tại nếu không có HTML content
  const heroTitle = homeContent?.title || "Không Gian Làm Việc Lý Tưởng";
  const heroSubtitle = homeContent?.subtitle || "Dành Cho Doanh Nghiệp Của Bạn";
  const heroDescription = homeContent?.description || "Khám phá hàng ngàn lựa chọn văn phòng cho thuê tại các vị trí đắc địa nhất.";
  const heroImage = homeContent?.imageUrl || "/images/BG.jpg";

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div>
        {/* HERO - Fixed height prevents CLS */}
        <div className="relative bg-gray-900 h-[400px] sm:h-[500px] lg:h-[600px]">
          {/* Image container */}
          <div className="absolute inset-0">
            <Image
              src={heroImage}
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
              <span className="block">{heroTitle}</span>
              <span className="block text-blue-400 mt-2">
                {heroSubtitle}
              </span>
            </h1>
            <p className="mt-4 max-w-md mx-auto text-lg text-gray-200 sm:text-xl md:mt-5 md:max-w-3xl drop-shadow-md">
              {heroDescription}
            </p>
          </div>
        </div>

        {/* Render sections dynamically */}
        {renderSections()}
      </div>
    </>
  );
}