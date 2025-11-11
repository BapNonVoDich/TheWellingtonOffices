import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';
const siteName = 'The Wellington Offices';
const defaultDescription = 'Nền tảng tìm kiếm và cho thuê văn phòng chuyên nghiệp tại Việt Nam. Khám phá hàng ngàn lựa chọn văn phòng cho thuê tại các vị trí đắc địa nhất.';

export interface SEOConfig {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description = defaultDescription,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    keywords,
    noindex = false,
  } = config;

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const imageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/images/BG.jpg`;
  const pageUrl = url || baseUrl;

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),
    authors: author ? [{ name: author }] : undefined,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      locale: 'vi_VN',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

// Structured Data Helpers
interface PropertySchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  image: string | string[];
  description: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo?: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  amenityFeature?: Array<{
    '@type': string;
    name: string;
    value: boolean;
  }>;
  hasOfferCatalog?: {
    '@type': string;
    name: string;
    itemListElement: Array<{
      '@type': string;
      position: number;
      itemOffered: {
        '@type': string;
        name: string;
        description: string;
        offers: {
          '@type': string;
          price: number;
          priceCurrency: string;
          availability: string;
          priceSpecification: {
            '@type': string;
            price: number;
            priceCurrency: string;
            unitCode: string;
          };
        };
      };
    }>;
  };
}

export function generatePropertySchema(property: {
  name: string;
  slug: string;
  address_line: string;
  imageUrls?: string[];
  description?: string;
  ward?: { name: string; district?: { name: string } };
  oldWard?: { name: string; district?: { name: string } };
  offices?: Array<{ area: number; price_per_sqm: number }>;
  latitude?: number | null;
  longitude?: number | null;
  amenities?: string[];
}): PropertySchema {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';
  const imageUrl = property.imageUrls?.[0] || `${baseUrl}/images/BG.jpg`;
  
  // Use ward if available, otherwise fallback to oldWard
  const ward = property.ward || property.oldWard;

  const schema: PropertySchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: property.name,
    url: `${baseUrl}/property/${property.slug}`,
    image: property.imageUrls || imageUrl,
    description: property.description || `Văn phòng cho thuê tại ${property.name}, ${ward?.name || ''}, ${ward?.district?.name || ''}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address_line,
      addressLocality: ward?.name || '',
      addressRegion: ward?.district?.name || '',
      addressCountry: 'VN',
    },
  };

  // Add geo coordinates if available
  if (property.latitude && property.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    };
  }

  // Add amenities as amenityFeature
  if (property.amenities && property.amenities.length > 0) {
    schema.amenityFeature = property.amenities.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    }));
  }

  // Add offers for offices
  if (property.offices && property.offices.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Văn phòng cho thuê',
      itemListElement: property.offices.map((office, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Product',
          name: `Văn phòng ${office.area}m²`,
          description: `Văn phòng cho thuê diện tích ${office.area}m² tại ${property.name}`,
          offers: {
            '@type': 'Offer',
            price: office.price_per_sqm * office.area,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: office.price_per_sqm,
              priceCurrency: 'USD',
              unitCode: 'MTK',
            },
          },
        },
      })),
    };
  }

  return schema;
}

export function generateArticleSchema(post: {
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  author: { name: string };
  createdAt: Date;
  updatedAt: Date;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';
  const imageUrl = post.imageUrl || `${baseUrl}/images/BG.jpg`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: imageUrl,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/BG.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/tin-tuc/${post.slug}`,
    },
  };
}

export function generateLocalBusinessSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteName,
    image: `${baseUrl}/images/BG.jpg`,
    '@id': `${baseUrl}#organization`,
    url: baseUrl,
    telephone: '0971777213',
    email: 'thewellingtonoffice@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Lê Lợi, P. Bến Thành',
      addressLocality: 'Quận 1',
      addressRegion: 'TP.HCM',
      addressCountry: 'VN',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
      opens: '08:00',
      closes: '18:00',
    },
    priceRange: '$$',
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewellingtonoffices.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/images/BG.jpg`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '0971777213',
      contactType: 'customer service',
      email: 'thewellingtonoffice@gmail.com',
      areaServed: 'VN',
      availableLanguage: 'Vietnamese',
    },
    sameAs: [
      // Có thể thêm social media links sau
    ],
  };
}

