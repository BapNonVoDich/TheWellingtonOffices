// src/app/admin/properties/edit/[id]/page.tsx
import { updateProperty } from '@/app/actions/propertyActions';
import prisma from '@/lib/prisma';
import WardCombobox from '@/app/components/WardCombobox';
import { notFound } from 'next/navigation';
import EditPropertyForm from './EditPropertyForm';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
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
      }
    }
  });

  if (!property) {
    notFound();
  }

  const defaultWard = property.ward ? {
    id: property.ward.id,
    name: `${property.ward.name}, ${property.ward.district.name}`,
    districtName: property.ward.district.name
  } : null;
  
  return (
    <EditPropertyForm property={property} districts={districts} defaultWard={defaultWard} />
  );
}