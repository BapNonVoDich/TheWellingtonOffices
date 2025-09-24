// src/app/admin/properties/new/page.tsx
import { createProperty } from '@/app/actions/propertyActions';
import prisma from '@/lib/prisma';
import WardCombobox from '@/app/components/WardCombobox';
import ImageUploader from '@/app/components/ImageUploader';

export default async function NewPropertyPage() {
  const districts = await prisma.district.findMany({
    orderBy: { name: 'asc' },
    include: {
      wards: {
        orderBy: { name: 'asc' },
      }
    }
  });

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thêm Tòa nhà mới</h1>
      <form action={createProperty} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Tòa nhà</label>
          <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div>
          <label htmlFor="address_line" className="block text-sm font-medium text-gray-700">Địa chỉ (Số nhà, Tên đường)</label>
          <input type="text" name="address_line" id="address_line" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
        </div>

        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700">Phường/Xã</label>
          <WardCombobox districts={districts} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
          <ImageUploader name="imageUrls" isMultiple={true} />
        </div>

        <div>
          <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">Tiện ích (ngăn cách bởi dấu phẩy)</label>
          <input 
            type="text" 
            name="amenities" 
            id="amenities" 
            placeholder="Vd: Gym, Hồ bơi, Bãi đỗ xe" 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Tạo Tòa nhà
          </button>
        </div>
      </form>
    </div>
  );
}