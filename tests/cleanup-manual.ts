/**
 * Script cleanup thủ công để xóa test data
 * 
 * Chạy: npx ts-node -P tsconfig.seed.json tests/cleanup-manual.ts
 * 
 * Script này sẽ xóa TẤT CẢ data có prefix "TEST_" để cleanup sau test
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAll() {
  console.log('🧹 Bắt đầu cleanup test data...\n');

  try {
    // 1. Cleanup offices trong test properties
    const testProperties = await prisma.property.findMany({
      where: {
        name: {
          startsWith: 'TEST_',
        },
      },
      select: { id: true },
    });

    if (testProperties.length > 0) {
      const propertyIds = testProperties.map(p => p.id);
      const deletedOffices = await prisma.office.deleteMany({
        where: {
          propertyId: {
            in: propertyIds,
          },
        },
      });
      console.log(`✅ Đã xóa ${deletedOffices.count} test offices`);
    }

    // 2. Cleanup test properties
    const deletedProperties = await prisma.property.deleteMany({
      where: {
        name: {
          startsWith: 'TEST_',
        },
      },
    });
    console.log(`✅ Đã xóa ${deletedProperties.count} test properties`);

    // 3. Cleanup test posts
    const deletedPosts = await prisma.post.deleteMany({
      where: {
        title: {
          startsWith: 'TEST_',
        },
      },
    });
    console.log(`✅ Đã xóa ${deletedPosts.count} test posts`);

    console.log('\n✨ Cleanup hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi khi cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAll();

