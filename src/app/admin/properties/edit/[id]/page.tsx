// src/app/admin/properties/edit/[id]/page.tsx
import { updateProperty } from '@/app/actions/propertyActions';
import prisma from '@/lib/prisma';
import WardCombobox from '@/app/components/WardCombobox';
import { notFound } from 'next/navigation';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  // Lay thong tin property can sua
  const { id } = await params; // Thêm await
  const property = await prisma.property.findUnique({
    where: { id: id },
    include: {
      ward: {
        include: {
          district: true
        }
      }
    }
  });

  // Lay toan bo danh sach districts/wards de truyen vao combobox
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
  
  // Su dung .bind de truyen them tham so 'id' vao server action
  const updatePropertyWithId = updateProperty.bind(null, property.id);

  // Chuan bi gia tri mac dinh cho WardCombobox
  const defaultWard = property.ward ? {
    id: property.ward.id,
    name: `${property.ward.name}, ${property.ward.district.name}`,
    districtName: property.ward.district.name
  } : null;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sửa thông tin Tòa nhà</h1>
      <form action={updatePropertyWithId} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Tòa nhà</label>
          <input type="text" name="name" id="name" required defaultValue={property.name} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="address_line" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <input type="text" name="address_line" id="address_line" required defaultValue={property.address_line} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        
        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700">Phường/Xã (sau 7/2025)</label>
          <WardCombobox districts={districts} defaultValue={defaultWard} />
        </div>

        
        <div>
          <label htmlFor="imageUrls" className="block text-sm font-medium text-gray-700">URL Hình ảnh (mỗi URL một dòng)</label>
          {/* THAY ĐỔI: Chuyển sang textarea và dùng join */}
          <textarea name="imageUrls" id="imageUrls" rows={4} defaultValue={property.imageUrls.join('\n')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
}