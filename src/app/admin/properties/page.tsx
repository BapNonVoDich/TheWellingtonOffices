'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteProperty } from '@/app/actions/propertyActions';
import type { Property, Office, Ward, District } from '@prisma/client';
import toast from 'react-hot-toast';

type PropertyWithRelations = Property & {
  ward: (Ward & { district: District }) | null;
  oldWard: ({ id: string; name: string; district: District }) | null;
  offices: Office[];
};

// Helper function to validate if a string is a valid URL
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || url.trim() === '') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithRelations[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      if (!res.ok) {
        throw new Error('Failed to fetch properties');
      }
      const data = await res.json();
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      toast.error('Không thể tải danh sách tòa nhà.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = properties;

    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address_line.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.ward?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.ward?.district?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.oldWard?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.oldWard?.district?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  }, [searchQuery, properties]);

  const handleDelete = () => {
    if (!propertyToDelete) return;

    startTransition(async () => {
      try {
        await deleteProperty(propertyToDelete.id);
        toast.success('Đã xóa tòa nhà thành công!');
        setPropertyToDelete(null);
        fetchProperties();
      } catch (error) {
        toast.error(`Lỗi khi xóa: ${(error as Error).message}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải danh sách tòa nhà...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tòa nhà</h1>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý và chỉnh sửa thông tin tòa nhà
            </p>
          </div>
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm tòa nhà mới
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm tòa nhà theo tên, địa chỉ, quận, phường..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có tòa nhà nào</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'Thử thay đổi từ khóa tìm kiếm'
              : 'Bắt đầu bằng cách thêm tòa nhà mới'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/properties/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Thêm tòa nhà mới
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tòa nhà
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khu vực
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số văn phòng
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {property.imageUrls && property.imageUrls.length > 0 && isValidUrl(property.imageUrls[0]) && (
                        <div className="flex-shrink-0 h-12 w-20 mr-4">
                          <Image
                            src={property.imageUrls[0]}
                            alt={property.name}
                            width={80}
                            height={48}
                            className="h-12 w-20 object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-500">{property.address_line}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {property.ward ? (
                        <span>{property.ward.name}, {property.ward.district.name} <span className="text-gray-500 text-xs">(Mới)</span></span>
                      ) : property.oldWard ? (
                        <span>{property.oldWard.name}, {property.oldWard.district.name} <span className="text-gray-500 text-xs">(Cũ)</span></span>
                      ) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.offices?.length || 0} văn phòng</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        href={`/admin/properties/${property.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Quản lý VP
                      </Link>
                      <Link
                        href={`/admin/properties/edit/${property.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Chỉnh sửa
                      </Link>
                      <button
                        onClick={() => setPropertyToDelete(property)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng số tòa nhà</div>
          <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng số văn phòng</div>
          <div className="text-2xl font-bold text-blue-600">
            {properties.reduce((sum, p) => sum + (p.offices?.length || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Văn phòng đang cho thuê</div>
          <div className="text-2xl font-bold text-green-600">
            {properties.reduce((sum, p) => sum + (p.offices?.filter(o => o.isAvailable).length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa tòa nhà <strong>&ldquo;{propertyToDelete.name}&rdquo;</strong> không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setPropertyToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

