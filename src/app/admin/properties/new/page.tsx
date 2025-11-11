// src/app/admin/properties/new/page.tsx
import prisma from '@/lib/prisma';
import NewPropertyForm from './NewPropertyForm';

export default async function NewPropertyPage() {
  const districts = await prisma.district.findMany({
    orderBy: { name: 'asc' },
    include: {
      wards: {
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          mergedFrom: true,
        },
      },
      oldWards: {
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          splitInto: true,
        },
      }
    }
  });

  return (
    <NewPropertyForm districts={districts} />
  );
}