// src/app/admin/properties/edit/[id]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditPropertyForm from './EditPropertyForm';

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      ward: {
        include: {
          district: true
        }
      }
    }
  });

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

  if (!property) {
    notFound();
  }

  const propertyWithRelations = await prisma.property.findUnique({
    where: { id },
    include: {
      ward: {
        include: { district: true }
      },
      oldWard: {
        include: { district: true }
      }
    }
  });

  const defaultWard = propertyWithRelations?.ward ? {
    id: propertyWithRelations.ward.id,
    name: `${propertyWithRelations.ward.name}, ${propertyWithRelations.ward.district.name}`,
    districtName: propertyWithRelations.ward.district.name,
  } : null;

  const defaultOldWard = propertyWithRelations?.oldWard ? {
    id: propertyWithRelations.oldWard.id,
    name: `${propertyWithRelations.oldWard.name}, ${propertyWithRelations.oldWard.district.name}`,
    districtName: propertyWithRelations.oldWard.district.name,
  } : null;
  
  return (
    <EditPropertyForm property={property} districts={districts} defaultWard={defaultWard} defaultOldWard={defaultOldWard} />
  );
}