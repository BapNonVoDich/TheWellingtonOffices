// prisma/seed.ts
import { PrismaClient, Role, Grade, OfficeType } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Upsert admin user
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 12);
  const adminEmployee = await prisma.employee.upsert({
    where: { email: 'admin@officesaigon.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@officesaigon.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Upserted admin user: ${adminEmployee.email}`);

  // 2. Clear old data
  console.log('Deleting old data...');
  await prisma.office.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.ward.deleteMany({});
  await prisma.district.deleteMany({});

  // 3. Seed Districts & Wards from JSON file
  console.log('Seeding districts...');
  const districtsPath = path.join(__dirname, 'data', 'districts.json');
  const districtsFile = fs.readFileSync(districtsPath, 'utf-8');
  const districtNames: string[] = JSON.parse(districtsFile);
  
  await prisma.district.createMany({
    data: districtNames.map(name => ({ name })),
    // Da xoa dong "skipDuplicates: true"
  });
  const districtsInDb = await prisma.district.findMany();
  console.log(`${districtsInDb.length} districts seeded.`);

  console.log('Seeding wards...');
  const wardsPath = path.join(__dirname, 'data', 'wards.json');
  const wardsFile = fs.readFileSync(wardsPath, 'utf-8');
  const wardsData: { district: string; ward: string; mergedFrom: string[] }[] = JSON.parse(wardsFile);
  
  const provinceMapping: { [key: string]: string } = { 'Thành phố Dĩ An': 'Tỉnh Bình Dương', 'Thành phố Thuận An': 'Tỉnh Bình Dương', 'Thành phố Thủ Dầu Một': 'Tỉnh Bình Dương', 'Thành phố Bến Cát': 'Tỉnh Bình Dương', 'Huyện Bàu Bàng': 'Tỉnh Bình Dương', 'Thị xã Tân Uyên': 'Tỉnh Bình Dương', 'Huyện Bắc Tân Uyên': 'Tỉnh Bình Dương', 'Huyện Phú Giáo': 'Tỉnh Bình Dương', 'Huyện Dầu Tiếng': 'Tỉnh Bình Dương', 'Thành phố Vũng Tàu': 'Tỉnh Bà Rịa - Vũng Tàu', 'Thành phố Bà Rịa': 'Tỉnh Bà Rịa - Vũng Tàu', 'Thị xã Phú Mỹ': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Long Điền': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Đất Đỏ': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Châu Đức': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Xuyên Mộc': 'Tỉnh Bà Rịa - Vũng Tàu', 'Huyện Côn Đảo': 'Tỉnh Bà Rịa - Vũng Tàu' };
  
  const wardsToCreate = wardsData.map(w => {
    const parentDistrictName = provinceMapping[w.district] || w.district;
    const district = districtsInDb.find(d => d.name === parentDistrictName);
    if (!district) return null;
    return { name: w.ward, districtId: district.id, mergedFrom: w.mergedFrom };
  }).filter(Boolean);

  // @ts-ignore
  await prisma.ward.createMany({ data: wardsToCreate });
  console.log(`${wardsToCreate.length} wards seeded.`);

  
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