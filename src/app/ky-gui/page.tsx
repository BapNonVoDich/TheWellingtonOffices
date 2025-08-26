// src/app/ky-gui/page.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
// Import action từ file riêng
import { handleConsignmentSubmit } from '@/app/actions/consignmentActions';

const initialState = {
  message: '',
  success: false,
};

// Component nút Submit để hiển thị trạng thái "pending"
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {pending ? 'Đang gửi...' : 'Gửi thông tin'}
        </button>
    )
}

export default function ConsignmentPage() {
  const [state, formAction] = useFormState(handleConsignmentSubmit, initialState);

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Ký gửi Bất động sản cho thuê</h1>
        <p className="mt-4 text-lg text-gray-600">Điền vào form dưới đây để gửi thông tin văn phòng của bạn đến đội ngũ của chúng tôi.</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <form action={formAction} className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Thông tin liên hệ của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <input type="text" name="contactName" id="contactName" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input type="tel" name="phone" id="phone" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Thông tin Bất động sản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <input type="text" name="propertyAddress" id="propertyAddress" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Loại hình</label>
                <input type="text" name="propertyType" id="propertyType" placeholder="Vd: Văn phòng truyền thống, Tòa nhà nguyên căn" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700">Diện tích (m²)</label>
                  <input type="number" name="area" id="area" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá cho thuê ($/tháng)</label>
                  <input type="number" name="price" id="price" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                </div>
              </div>
              <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả thêm</label>
                  <textarea name="description" id="description" rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              </div>
            </div>
          </div>
          
          {state.message && (
             <p className={`${state.success ? 'text-green-600' : 'text-red-600'} text-sm font-semibold`}>
                {state.message}
             </p>
          )}

          <div className="flex justify-end">
              <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}