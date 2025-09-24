// prisma/migrateSlugs.ts
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/utils'; // Điều chỉnh đường dẫn nếu cần

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration to add/update slugs for all properties using raw query...');

  // 1. Dùng raw query để chỉ lấy các trường cần thiết, tránh lỗi validation của Prisma
  const propertiesToUpdate = await prisma.property.findRaw({
    filter: {}, // Lấy tất cả documents
    options: { projection: { _id: 1, name: 1, address_line: 1 } }, // Chỉ lấy các trường id, name, và address_line
  }) as unknown as { _id: { $oid: string }; name: string; address_line: string }[];

  if (propertiesToUpdate.length === 0) {
    console.log('No properties found to update.');
    return;
  }

  console.log(`Found ${propertiesToUpdate.length} properties to process.`);
  let updatedCount = 0;
  const generatedSlugs = new Set<string>(); // Theo dõi slug để tránh trùng lặp trong một lần chạy

  for (const property of propertiesToUpdate) {
    const propertyId = property._id.$oid;
    try {
      let newSlug = slugify(`${property.name} ${property.address_line}`);

      // 2. Đảm bảo slug là duy nhất
      // Mặc dù schema đã có `@unique`, việc kiểm tra này giúp xử lý các trường hợp tên + địa chỉ trùng nhau
      while (generatedSlugs.has(newSlug)) {
        console.warn(`Duplicate slug "${newSlug}" detected in this run. Appending random suffix.`);
        newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 7)}`;
      }
      generatedSlugs.add(newSlug);

      // 3. Cập nhật lại document bằng Prisma Client (Thao tác này an toàn)
      await prisma.property.update({
        where: { id: propertyId },
        data: { slug: newSlug },
      });

      console.log(`Updated property "${property.name}" with new slug: ${newSlug}`);
      updatedCount++;
    } catch (error) {
      console.error(`Failed to update property "${property.name}" (ID: ${propertyId}):`, error);
    }
  }

  console.log(`Slug migration finished. Successfully updated ${updatedCount} properties!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });