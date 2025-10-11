// src/app/admin/properties/new/NewPropertyForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { createProperty } from '@/app/actions/propertyActions';
import WardCombobox from '@/app/components/WardCombobox';
import ImageUploader from '@/app/components/ImageUploader';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import type { District, Ward } from '@prisma/client';
import { useRouter } from 'next/navigation';

type DistrictWithWards = District & { wards: Ward[] };

const initialState = {
  message: '',
  success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            {pending ? 'Đang xử lý...' : 'Lưu'}
        </button>
    );
}

export default function NewPropertyForm({ districts }: { districts: DistrictWithWards[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]); // Thêm state cho previews
  const [formState, formAction] = useActionState(createProperty, initialState);
  const router = useRouter();

  useEffect(() => {
    if (formState.success) {
      router.push('/admin/dashboard');
    }
  }, [formState.success, router]);

  const handleSubmit = (formData: FormData) => {
    files.forEach(file => {
      formData.append('imageFiles', file);
    });
    formAction(formData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thêm Tòa nhà mới</h1>
      <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Tòa nhà</label>
          <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="address_line" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <input type="text" name="address_line" id="address_line" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>

        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700">Phường/Xã (sau 7/2025)</label>
          <WardCombobox districts={districts} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
          <ImageUploader 
            name="imageUrls" 
            isMultiple={true} 
            onFilesChange={setFiles}
            onPreviewChange={setPreviews} // Thêm prop này
          />
        </div>

        {formState.message && (
          <p className={`${formState.success ? 'text-green-600' : 'text-red-600'} text-sm font-semibold`}>
            {formState.message}
          </p>
        )}

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}