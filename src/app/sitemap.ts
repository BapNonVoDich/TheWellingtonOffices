// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Lấy dữ liệu động từ Prisma
  const properties = await prisma.property.findMany();
  const posts = await prisma.post.findMany({
    where: { published: true },
  });
  const districts = await prisma.district.findMany();
  const wards = await prisma.ward.findMany({
    include: { district: true },
  });

  // Tạo sitemap cho các trang tĩnh
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/tim-toa-nha`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tim-van-phong`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ky-gui`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ve-chung-toi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Tạo sitemap cho các trang tòa nhà (Property)
  const propertyPages = properties.map((property) => ({
    url: `${baseUrl}/property/${property.id}`,
    lastModified: property.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Tạo sitemap cho các trang tin tức (Post)
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/tin-tuc/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Tạo sitemap cho các trang quận
  const districtPages = districts.map((district) => ({
    url: `${baseUrl}/van-phong-cho-thue/${slugify(district.name)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Tạo sitemap cho các trang phường
  const wardPages = wards.map((ward) => ({
    url: `${baseUrl}/van-phong-cho-thue/${slugify(ward.district.name)}/${slugify(ward.name)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));
  
  return [...staticPages, ...propertyPages, ...postPages, ...districtPages, ...wardPages] as MetadataRoute.Sitemap;
}