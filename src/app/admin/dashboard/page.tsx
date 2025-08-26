'use client'; // Chuyen thanh Client Component de quan ly state

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { deleteProperty } from '@/app/actions/propertyActions';
import type { Property, Office, Ward, District } from '@prisma/client';

// Dinh nghia kieu du lieu cho property, lay tu server
// Chung ta se dung 'any' de don gian hoa, vi trang nay khong can type phuc tap
type PropertyWithRelations = Property & {
  ward: (Ward & { district: District }) | null;
  offices: Office[];
};

// Component moi de render trang
export default function DashboardPage() {
  // State de luu danh sach property
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  // State de quan ly modal
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyWithRelations | null>(null);
  
  const [isPending, startTransition] = useTransition();

  // Su dung useEffect de lay du lieu ban dau o phia client
  useEffect(() => {
    // Dinh nghia ham de lay data
    const fetchProperties = async () => {
      // Chung ta se tao API route nay o buoc sau
      const res = await fetch('/api/properties'); 
      const data = await res.json();
      setProperties(data);
    };
    fetchProperties();
  }, []);

  const handleDelete = () => {
    if (!propertyToDelete) return;

    startTransition(async () => {
      try {
        await deleteProperty(propertyToDelete.id);
        // Cap nhat lai danh sach sau khi xoa thanh cong
        setProperties(properties.filter(p => p.id !== propertyToDelete.id));
        setPropertyToDelete(null);
      } catch (error) {
        alert('Xóa thất bại: ' + (error as Error).message);
      }
    });
  };

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý các Tòa nhà</h1>
          <Link href="/admin/properties/new" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            + Thêm Tòa nhà mới
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6">Tên Tòa nhà</th>
                <th scope="col" className="py-3 px-6">Khu vực</th>
                <th scope="col" className="py-3 px-6">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">{property.name}</td>
                  <td className="py-4 px-6">{property.ward?.name}, {property.ward?.district.name}</td>
                  <td className="py-4 px-6 space-x-2">
                    <Link href={`/admin/properties/${property.id}`} className="text-green-600 hover:underline">Quản lý VP</Link>
                    <Link href={`/admin/properties/edit/${property.id}`} className="text-blue-600 hover:underline">Sửa</Link>
                    <button onClick={() => setPropertyToDelete(property)} className="text-red-600 hover:underline">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cua so Modal xac nhan xoa */}
      {propertyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-sm w-full">
            <h3 className="text-lg font-bold">Xác nhận Xóa</h3>
            <p className="py-4">Bạn có chắc chắn muốn xóa tòa nhà &ldquo;{propertyToDelete.name}&rdquo; không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end space-x-2">
              {/* ... buttons ... */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}