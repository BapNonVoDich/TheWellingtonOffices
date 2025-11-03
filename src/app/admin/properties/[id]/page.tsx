'use client';

import { useState, useEffect, useTransition, Fragment, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { createOffice, updateOffice, deleteOffice } from '@/app/actions/officeActions';
import { Property, Office, Grade } from '@prisma/client';

// Dinh nghia kieu du lieu day du
type PropertyWithOffices = Property & {
  offices: Office[];
};

export default function ManageOfficesPage({ params }: { params: { id: string } }) {
  const propertyId = params.id;
  const [property, setProperty] = useState<PropertyWithOffices | null>(null);
  const [loading, setLoading] = useState(true);

  // State de quan ly cac modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [officeToEdit, setOfficeToEdit] = useState<Office | null>(null);
  const [officeToDelete, setOfficeToDelete] = useState<Office | null>(null);

  // Ham de tai lai du lieu
  const fetchProperty = useCallback(async () => {
    // Chung ta se tao API nay o buoc sau
    const res = await fetch(`/api/properties/${propertyId}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProperty(data);
    setLoading(false);
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [propertyId, fetchProperty]);
  
  if (loading) return <div className="text-center p-8">Đang tải...</div>;
  if (!property) return notFound();

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Văn phòng</h1>
            <p className="text-gray-600">Cho tòa nhà: {property.name}</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            + Thêm Văn phòng mới
          </button>
        </div>
        
        {/* Bang danh sach van phong */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="py-3 px-4">Diện tích</th>
                <th className="py-3 px-4">Giá ($/m²)</th>
                <th className="py-3 px-4">Tầng</th>
                <th className="py-3 px-4">Hạng</th>
                <th className="py-3 px-4">Thời hạn (tháng)</th>
                <th className="py-3 px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {property.offices.map(office => (
                <tr key={office.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{office.area} m²</td>
                  <td className="py-3 px-4">${office.price_per_sqm}</td>
                  <td className="py-3 px-4">{office.floor || '-'}</td>
                  <td className="py-3 px-4">{office.grade}</td>
                  <td className="py-3 px-4">{office.minimumLeaseTerm || '?'} - {office.maximumLeaseTerm || '?'}</td>
                  <td className="py-3 px-4 space-x-2">
                    <button onClick={() => setOfficeToEdit(office)} className="text-blue-600 hover:underline text-xs">Sửa</button>
                    <button onClick={() => setOfficeToDelete(office)} className="text-red-600 hover:underline text-xs">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cac Modal */}
      {showAddModal && <OfficeModal mode="create" propertyId={propertyId} onClose={() => setShowAddModal(false)} onFinished={fetchProperty} />}
      {officeToEdit && <OfficeModal mode="edit" propertyId={propertyId} office={officeToEdit} onClose={() => setOfficeToEdit(null)} onFinished={fetchProperty} />}
      {officeToDelete && <DeleteModal office={officeToDelete} propertyId={propertyId} onClose={() => setOfficeToDelete(null)} onFinished={fetchProperty} />}
    </>
  );
}

// ---- CÁC COMPONENT CON CHO MODAL ----

function OfficeModal({ mode, propertyId, office, onClose, onFinished }: { mode: 'create' | 'edit', propertyId: string, office?: Office | null, onClose: () => void, onFinished: () => void }) {
  const [isPending, startTransition] = useTransition();
  const title = mode === 'create' ? 'Thêm Văn phòng mới' : 'Sửa thông tin Văn phòng';
  const action = mode === 'create' ? createOffice.bind(null, propertyId) : updateOffice.bind(null, office!.id, propertyId);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await action(formData);
        onClose();
        onFinished();
      } catch (error) {
        alert("Lỗi: " + (error as Error).message);
      }
    });
  };

  return (
    <Modal title={title} onClose={onClose}>
      <OfficeForm onSubmit={handleSubmit} isPending={isPending} defaultValues={office} />
    </Modal>
  )
}

function DeleteModal({ office, propertyId, onClose, onFinished }: { office: Office, propertyId: string, onClose: () => void, onFinished: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteOffice(office.id, propertyId);
        onClose();
        onFinished();
      } catch (error) {
        alert("Lỗi: " + (error as Error).message);
      }
    });
  };

  return (
    <Modal title="Xác nhận Xóa" onClose={onClose}>
      <p className="py-4">Bạn có chắc chắn muốn xóa văn phòng (Diện tích: {office.area}m², Tầng: {office.floor}) không?</p>
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Hủy</button>
        <button onClick={handleDelete} disabled={isPending} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400">
          {isPending ? 'Đang xóa...' : 'Xác nhận'}
        </button>
      </div>
    </Modal>
  )
}


function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-lg w-full">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// Component Form voi logic tinh toan gia dong
function OfficeForm({ onSubmit, isPending, defaultValues }: { onSubmit: (formData: FormData) => void; isPending: boolean; defaultValues?: Office | null }) {
  const [area, setArea] = useState(defaultValues?.area || 0);
  const [pricePerSqm, setPricePerSqm] = useState(defaultValues?.price_per_sqm || 0);
  const [totalPrice, setTotalPrice] = useState( (defaultValues?.area || 0) * (defaultValues?.price_per_sqm || 0) );
  const [lastEdited, setLastEdited] = useState<'area' | 'price' | 'total' | null>(null);

  useEffect(() => {
    if (lastEdited === 'area' || lastEdited === 'price') {
      const newTotal = (area || 0) * (pricePerSqm || 0);
      setTotalPrice(parseFloat(newTotal.toFixed(2)));
    }
  }, [area, pricePerSqm, lastEdited]);

  useEffect(() => {
    if (lastEdited === 'total' && area > 0) {
      const newPricePerSqm = (totalPrice || 0) / area;
      setPricePerSqm(parseFloat(newPricePerSqm.toFixed(2)));
    } else if (lastEdited === 'total' && (area === 0 || !area) ) {
      setPricePerSqm(0);
    }
  }, [totalPrice, area, lastEdited]);
  
  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="area" className="block text-sm font-medium">Diện tích (m²)</label>
        <input 
          type="number" name="area" id="area" value={area}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setArea(isNaN(val) ? 0 : val);
            setLastEdited('area');
          }}
          required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
      </div>
      <div>
        <label htmlFor="price_per_sqm" className="block text-sm font-medium">Giá ($/m²)</label>
        <input 
          type="number" step="0.1" name="price_per_sqm" id="price_per_sqm" value={pricePerSqm}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setPricePerSqm(isNaN(val) ? 0 : val);
            setLastEdited('price');
          }}
          required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
      </div>
      <div>
        <label htmlFor="total_price" className="block text-sm font-medium text-gray-700">Tổng giá (tháng)</label>
        <input 
          type="number" step="0.1" id="total_price" value={totalPrice}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setTotalPrice(isNaN(val) ? 0 : val);
            setLastEdited('total');
          }}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/>
      </div>
      <div>
        <label htmlFor="floor" className="block text-sm font-medium">Tầng</label>
        <input type="text" name="floor" id="floor" defaultValue={defaultValues?.floor || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
      </div>
      <div>
        <label htmlFor="grade" className="block text-sm font-medium">Hạng</label>
        <select name="grade" id="grade" defaultValue={defaultValues?.grade} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
          {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="minimumLeaseTerm" className="block text-sm font-medium">Hạn thuê Tối thiểu (tháng)</label>
          <input type="number" name="minimumLeaseTerm" id="minimumLeaseTerm" defaultValue={defaultValues?.minimumLeaseTerm || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
        </div>
        <div>
          <label htmlFor="maximumLeaseTerm" className="block text-sm font-medium">Hạn thuê Tối đa (tháng)</label>
          <input type="number" name="maximumLeaseTerm" id="maximumLeaseTerm" defaultValue={defaultValues?.maximumLeaseTerm || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
        </div>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium">Loại hình</label>
        <select name="type" id="type" defaultValue={defaultValues?.type} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="TRADITIONAL">Truyền thống</option>
          <option value="SERVICED">Trọn gói</option>
        </select>
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isPending} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {isPending ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}