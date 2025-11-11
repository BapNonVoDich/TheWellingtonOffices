import { Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Tạo Prisma client riêng cho cleanup để tránh conflict
const prisma = new PrismaClient();

/**
 * Helper để cleanup test data sau khi test
 * CHỈ xóa các items có prefix "TEST_" để đảm bảo không xóa data thực tế
 * 
 * LƯU Ý: Tất cả test data phải có prefix "TEST_" trong tên
 */

export async function cleanupTestPosts() {
  try {
    // Tìm posts có title chứa "TEST_" prefix
    const testPosts = await prisma.post.findMany({
      where: {
        title: {
          startsWith: 'TEST_',
        },
      },
    });

    if (testPosts.length > 0) {
      await prisma.post.deleteMany({
        where: {
          id: {
            in: testPosts.map(p => p.id),
          },
        },
      });
      console.log(`🧹 Cleaned up ${testPosts.length} test posts`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up test posts:', error);
    // Không throw để không làm gián đoạn test
  }
}

export async function cleanupTestProperties() {
  try {
    // Tìm properties có name chứa "TEST_" prefix
    const testProperties = await prisma.property.findMany({
      where: {
        name: {
          startsWith: 'TEST_',
        },
      },
    });

    if (testProperties.length > 0) {
      // Xóa offices của test properties trước
      await prisma.office.deleteMany({
        where: {
          propertyId: {
            in: testProperties.map(p => p.id),
          },
        },
      });

      // Sau đó xóa properties
      await prisma.property.deleteMany({
        where: {
          id: {
            in: testProperties.map(p => p.id),
          },
        },
      });
      console.log(`🧹 Cleaned up ${testProperties.length} test properties`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up test properties:', error);
    // Không throw để không làm gián đoạn test
  }
}

export async function cleanupTestOffices() {
  try {
    // Tìm offices trong test properties
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
      const testOffices = await prisma.office.findMany({
        where: {
          propertyId: {
            in: propertyIds,
          },
        },
      });

      if (testOffices.length > 0) {
        await prisma.office.deleteMany({
          where: {
            id: {
              in: testOffices.map(o => o.id),
            },
          },
        });
        console.log(`🧹 Cleaned up ${testOffices.length} test offices`);
      }
    }
  } catch (error) {
    console.error('❌ Error cleaning up test offices:', error);
    // Không throw để không làm gián đoạn test
  }
}

/**
 * Cleanup tất cả test data
 * Được gọi sau khi chạy test suite
 */
export async function cleanupAllTestData() {
  console.log('\n🧹 Starting cleanup of all test data...');
  await cleanupTestOffices(); // Phải cleanup offices trước vì có foreign key
  await cleanupTestProperties();
  await cleanupTestPosts();
  console.log('✅ Cleanup complete!\n');
}

/**
 * Lấy ID của item được tạo trong test để cleanup sau
 */
export async function getCreatedItemId(
  page: Page,
  itemType: 'post' | 'property',
  itemName: string
): Promise<string | null> {
  try {
    if (itemType === 'post') {
      await page.goto('/admin/posts');
      await page.waitForLoadState('networkidle');
      
      // Tìm link edit của item
      const itemLink = page.locator(`a:has-text("${itemName}")`).first();
      if (await itemLink.count() > 0) {
        const href = await itemLink.getAttribute('href');
        if (href) {
          const match = href.match(/\/edit\/([^\/]+)/);
          return match ? match[1] : null;
        }
      }
    } else if (itemType === 'property') {
      await page.goto('/admin/properties');
      await page.waitForLoadState('networkidle');
      
      const itemLink = page.locator(`a:has-text("${itemName}")`).first();
      if (await itemLink.count() > 0) {
        const href = await itemLink.getAttribute('href');
        if (href) {
          const match = href.match(/\/edit\/([^\/]+)/);
          return match ? match[1] : null;
        }
      }
    }
  } catch (error) {
    console.error('Error getting created item ID:', error);
  }
  return null;
}

