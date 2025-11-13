// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Districts (skip if already exist)
  console.log('Seeding districts...');
  const districtsPath = path.join(__dirname, 'data', 'districts.json');
  const districtsFile = fs.readFileSync(districtsPath, 'utf-8');
  const districtNames: string[] = JSON.parse(districtsFile);
  
  // Get existing districts
  const existingDistricts = await prisma.district.findMany();
  const existingDistrictNames = new Set(existingDistricts.map(d => d.name));
  
  // Only create new districts
  const newDistricts = districtNames
    .filter(name => !existingDistrictNames.has(name))
    .map(name => ({ name }));
  
  if (newDistricts.length > 0) {
    await prisma.district.createMany({
      data: newDistricts,
    });
    console.log(`Created ${newDistricts.length} new districts.`);
  } else {
    console.log('All districts already exist.');
  }
  
  const districtsInDb = await prisma.district.findMany();
  console.log(`Total districts in database: ${districtsInDb.length}`);

  // 2. Seed OldWards first (skip if already exist)
  console.log('Seeding old wards...');
  const oldWardsPath = path.join(__dirname, 'data', 'oldWard.json');
  const oldWardsFile = fs.readFileSync(oldWardsPath, 'utf-8');
  const oldWardsData: { district: string; ward: string; splitInto: string[] }[] = JSON.parse(oldWardsFile);
  
  const provinceMapping: { [key: string]: string } = { 'Thành phố Dĩ An': 'Tỉnh Bình Dương', 'Thành phố Thuận An': 'Tỉnh Bình Dương', 'Thành phố Thủ Dầu Một': 'Tỉnh Bình Dương', 'Thành phố Bến Cát': 'Tỉnh Bình Dương', 'Huyện Bàu Bàng': 'Tỉnh Bình Dương', 'Thị xã Tân Uyên': 'Tỉnh Bình Dương', 'Huyện Bắc Tân Uyên': 'Tỉnh Bình Dương', 'Huyện Phú Giáo': 'Tỉnh Bình Dương', 'Huyện Dầu Tiếng': 'Tỉnh Bình Dương', 'Thành phố Vũng Tàu': 'Tỉnh Bà Rịa - Vũng Tàu', 'Thành phố Bà Rịa': 'Tỉnh Bà Rịa - Vũng Tàu', 'Thị xã Phú Mỹ': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Long Điền': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Đất Đỏ': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Châu Đức': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Xuyên Mộc': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Côn Đảo': 'Tỉnh Bà Rịa - Vũng Tàu' };
  
  // Get existing old wards
  const existingOldWards = await prisma.oldWard.findMany();
  const existingOldWardKeys = new Set(
    existingOldWards.map(ow => {
      const district = districtsInDb.find(d => d.id === ow.districtId);
      return district ? `${district.name}|${ow.name}` : ow.name;
    })
  );
  
  const oldWardsToCreate = oldWardsData
    .map(w => {
      const parentDistrictName = provinceMapping[w.district] || w.district;
      const district = districtsInDb.find(d => d.name === parentDistrictName);
      if (!district) return null;
      const key = `${parentDistrictName}|${w.ward}`;
      if (existingOldWardKeys.has(key)) return null;
      return { name: w.ward, districtId: district.id };
    })
    .filter(Boolean);

  if (oldWardsToCreate.length > 0) {
    // @ts-expect-error - Type inference issue with filtered array
    await prisma.oldWard.createMany({ data: oldWardsToCreate });
    console.log(`Created ${oldWardsToCreate.length} new old wards.`);
  } else {
    console.log('All old wards already exist.');
  }
  
  const oldWardsInDb = await prisma.oldWard.findMany();
  console.log(`Total old wards in database: ${oldWardsInDb.length}`);

  // Create a map of old ward names to their IDs (for fallback lookup)
  const oldWardNameToId: { [key: string]: string } = {};
  oldWardsInDb.forEach((ow: { id: string; name: string; districtId: string }) => {
    oldWardNameToId[ow.name] = ow.id;
  });

  // 3. Seed Wards (skip if already exist)
  console.log('Seeding wards...');
  const wardsPath = path.join(__dirname, 'data', 'wards.json');
  const wardsFile = fs.readFileSync(wardsPath, 'utf-8');
  const wardsData: { district: string; ward: string; mergedFrom: string[] }[] = JSON.parse(wardsFile);
  
  // Get existing wards
  const existingWards = await prisma.ward.findMany();
  const existingWardKeys = new Set(
    existingWards.map(w => {
      const district = districtsInDb.find(d => d.id === w.districtId);
      return district ? `${district.name}|${w.name}` : w.name;
    })
  );
  
  const wardsToCreate = wardsData
    .map(w => {
      const parentDistrictName = provinceMapping[w.district] || w.district;
      const district = districtsInDb.find(d => d.name === parentDistrictName);
      if (!district) return null;
      const key = `${parentDistrictName}|${w.ward}`;
      if (existingWardKeys.has(key)) return null;
      return { name: w.ward, districtId: district.id };
    })
    .filter(Boolean);

  if (wardsToCreate.length > 0) {
    // @ts-expect-error - Type inference issue with filtered array
    await prisma.ward.createMany({ data: wardsToCreate });
    console.log(`Created ${wardsToCreate.length} new wards.`);
  } else {
    console.log('All wards already exist.');
  }
  
  const wardsInDb = await prisma.ward.findMany();
  console.log(`Total wards in database: ${wardsInDb.length}`);

  // Create a map of ward names to their IDs (for fallback lookup)
  const wardNameToId: { [key: string]: string } = {};
  wardsInDb.forEach((w: { id: string; name: string; districtId: string }) => {
    wardNameToId[w.name] = w.id;
  });

  // Now establish the relationships
  // Note: In MongoDB with Prisma, many-to-many relationships use explicit arrays of ObjectIds
  console.log('Establishing OldWard -> Ward relationships (splitInto/mergedFrom)...');
  
  // Build a better lookup structure that includes district context
  // Map: "district|wardName" -> id
  const oldWardKeyToId: { [key: string]: string } = {};
  oldWardsInDb.forEach((ow: { id: string; name: string; districtId: string }) => {
    const district = districtsInDb.find(d => d.id === ow.districtId);
    if (district) {
      const key = `${district.name}|${ow.name}`;
      oldWardKeyToId[key] = ow.id;
    }
  });

  const wardKeyToId: { [key: string]: string } = {};
  wardsInDb.forEach((w: { id: string; name: string; districtId: string }) => {
    const district = districtsInDb.find(d => d.id === w.districtId);
    if (district) {
      const key = `${district.name}|${w.name}`;
      wardKeyToId[key] = w.id;
    }
  });

  // Update OldWard splitInto arrays
  let connectedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const oldWardData of oldWardsData) {
    const parentDistrictName = provinceMapping[oldWardData.district] || oldWardData.district;
    const oldWardKey = `${parentDistrictName}|${oldWardData.ward}`;
    const oldWardId = oldWardKeyToId[oldWardKey];
    
    if (!oldWardId) {
      skippedCount++;
      continue;
    }

    // Find ward IDs matching the splitInto names in the same district context
    const wardIds = oldWardData.splitInto
      .map(wardName => {
        // Try to find ward in the same district first
        const wardKey = `${parentDistrictName}|${wardName}`;
        return wardKeyToId[wardKey] || wardNameToId[wardName]; // Fallback to simple name lookup
      })
      .filter((id): id is string => id !== undefined);

    if (wardIds.length > 0) {
      try {
        // Check if splitInto already has data
        const existingOldWard = await prisma.oldWard.findUnique({
          where: { id: oldWardId },
          select: { splitInto: true },
        });
        
        // Only update if splitInto is empty or doesn't match expected data
        if (!existingOldWard || existingOldWard.splitInto.length === 0 || 
            JSON.stringify(existingOldWard.splitInto.sort()) !== JSON.stringify(wardIds.sort())) {
          await prisma.oldWard.update({
            where: { id: oldWardId },
            data: {
              splitInto: wardIds,
            },
          });
          connectedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error updating OldWard ${oldWardData.ward}:`, error);
        errorCount++;
      }
    } else {
      skippedCount++;
    }
  }

  // Update Ward mergedFrom arrays
  for (const wardData of wardsData) {
    const parentDistrictName = provinceMapping[wardData.district] || wardData.district;
    const wardKey = `${parentDistrictName}|${wardData.ward}`;
    const wardId = wardKeyToId[wardKey] || wardNameToId[wardData.ward];
    
    if (!wardId) {
      skippedCount++;
      continue;
    }

    // Find old ward IDs matching the mergedFrom names
    const oldWardIds = wardData.mergedFrom
      .map(oldWardName => {
        // Try to find old ward in the same district first
        const oldWardKey = `${parentDistrictName}|${oldWardName}`;
        return oldWardKeyToId[oldWardKey] || oldWardNameToId[oldWardName]; // Fallback to simple name lookup
      })
      .filter((id): id is string => id !== undefined);

    if (oldWardIds.length > 0) {
      try {
        // Check if mergedFrom already has data
        const existingWard = await prisma.ward.findUnique({
          where: { id: wardId },
          select: { mergedFrom: true },
        });
        
        // Only update if mergedFrom is empty or doesn't match expected data
        if (!existingWard || existingWard.mergedFrom.length === 0 || 
            JSON.stringify(existingWard.mergedFrom.sort()) !== JSON.stringify(oldWardIds.sort())) {
          await prisma.ward.update({
            where: { id: wardId },
            data: {
              mergedFrom: oldWardIds,
            },
          });
          connectedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error updating Ward ${wardData.ward}:`, error);
        errorCount++;
      }
    } else {
      skippedCount++;
    }
  }

  console.log(`Relationships established: ${connectedCount} connected, ${skippedCount} skipped, ${errorCount} errors.`);

  // 4. Create admin user (skip if already exists)
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin User';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existingAdmin = await prisma.employee.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const adminEmployee = await prisma.employee.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: Role.ADMIN,
          createdAt: new Date('2000-01-01T00:00:00.000Z'),
        },
      });
      console.log(`Created admin user: ${adminEmployee.email}`);
    } else {
      console.log(`Admin user ${adminEmail} already exists.`);
    }
  } else {
    console.log('Skipping admin user creation (missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD)');
  }

  // 5. Seed Site Content (skip if already exists)
  console.log('Seeding site content...');
  const adminUser = await prisma.employee.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!adminUser) {
    console.log('Skipping site content seeding (no admin user found)');
  } else {
    const siteContentData = [
      {
        key: 'home',
        title: 'Không Gian Làm Việc Lý Tưởng',
        subtitle: 'Dành Cho Doanh Nghiệp Của Bạn',
        description: 'Khám phá hàng ngàn lựa chọn văn phòng cho thuê tại các vị trí đắc địa nhất.',
        imageUrl: '/images/BG.jpg',
      },
      {
        key: 'contact',
        title: 'Liên hệ với chúng tôi',
        description: 'Chúng tôi luôn sẵn sàng lắng nghe. Hãy để lại lời nhắn và chúng tôi sẽ phản hồi sớm nhất có thể.',
        metadata: JSON.stringify({
          address: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
          phone: '097 1777213',
          email: 'thewellingtonoffice@gmail.com',
          workingHours: 'T2 - T6: 8:00 - 18:00',
        }),
      },
      {
        key: 'about',
        title: 'Về The Wellington Offices',
        description: 'Đối tác tin cậy của bạn trong lĩnh vực không gian làm việc linh hoạt và hiệu quả.',
        content: JSON.stringify({
          mission: {
            title: 'Sứ mệnh của chúng tôi',
            text: 'Mang đến không gian làm việc lý tưởng, hỗ trợ sự phát triển bền vững cho mọi doanh nghiệp. Chúng tôi cam kết cung cấp dịch vụ tận tâm và giải pháp tối ưu nhất.',
          },
          team: {
            title: 'Đội ngũ của chúng tôi',
            text: 'Đội ngũ The Wellington Offices là tập hợp những chuyên gia giàu kinh nghiệm và nhiệt huyết trong lĩnh vực bất động sản thương mại. Chúng tôi luôn nỗ lực để hiểu rõ nhu cầu của khách hàng và cung cấp những giải pháp phù hợp nhất.',
          },
        }),
        imageUrl: '/images/BG.jpg',
      },
      {
        key: 'header',
        metadata: JSON.stringify({
          phone: '097 1777213',
          email: 'thewellingtonoffice@gmail.com',
        }),
      },
      {
        key: 'footer',
        metadata: JSON.stringify({
          companyDescription: 'Nền tảng tìm kiếm và cho thuê văn phòng hàng đầu, cung cấp giải pháp không gian làm việc tối ưu cho doanh nghiệp của bạn tại TP.HCM và các khu vực lân cận.',
          address: '18E Cộng Hoà, P. Tân Bình, Q. Tân Bình, TP.HCM',
          phone: '097 1777213',
          email: 'thewellingtonoffice@gmail.com',
          workingHours: 'T2 - T6: 8:00 - 18:00',
          facebook: '#',
          instagram: '#',
          linkedin: '#',
          tiktok: '#',
        }),
      },
    ];

    for (const content of siteContentData) {
      const existing = await prisma.siteContent.findUnique({
        where: { key: content.key },
      });

      if (!existing) {
        await prisma.siteContent.create({
          data: {
            ...content,
            updatedById: adminUser.id,
          },
        });
        console.log(`Created site content for key: ${content.key}`);
      } else {
        console.log(`Site content for key ${content.key} already exists.`);
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });