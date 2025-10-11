// src/app/admin/properties/edit/[id]/EditPropertyForm.tsx
'use client';

import { useActionState, useState, useEffect } from 'react';
import {  useFormStatus } from 'react-dom';
import { updateProperty } from '@/app/actions/propertyActions';
import WardCombobox from '@/app/components/WardCombobox';
import ImageUploader from '@/app/components/ImageUploader';
import { useRouter } from 'next/navigation';
import type { District, Ward, Property } from '@prisma/client';
import toast from 'react-hot-toast';

type DistrictWithWards = District & { wards: Ward[] };

type WardOption = {
  id: string;
  name: string;
  districtName: string;
};

interface EditPropertyFormProps {
    property: Property & { ward: (Ward & { district: District }) | null };
    districts: DistrictWithWards[];
    defaultWard: WardOption | null;
}

const initialState = {
  message: '',
  success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            {pending ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
    );
}

export default function EditPropertyForm({ property, districts, defaultWard }: EditPropertyFormProps) {
  const router = useRouter();
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(property.imageUrls);
  
  const [formState, formAction] = useActionState(updateProperty.bind(null, property.id), initialState);

  useEffect(() => {
    if (formState.success) {
      toast.success(formState.message);
      router.push('/admin/dashboard');
    } else if (formState.message) {
      toast.error(formState.message);
    }
  }, [formState, router]);

  const handleSubmit = (formData: FormData) => {
      // Thêm các file mới vào FormData
      newFiles.forEach(file => {
          formData.append('newImageFiles', file);
      });
      
      // Thêm các URL ảnh cũ còn lại vào FormData
      previews.filter(url => !url.startsWith('blob:')).forEach(url => {
          formData.append('existingImageUrls', url);
      });
      
      formAction(formData);
  };
    
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Sửa thông tin Tòa nhà</h1>
      <form action={handleSubmit} className="space-y-6">
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
          <label className="block text-sm font-medium text-gray-700">URL Hình ảnh</label>
          <ImageUploader 
              name="imageUrls" 
              isMultiple={true} 
              defaultValue={property.imageUrls} 
              onFilesChange={setNewFiles}
              onPreviewChange={setPreviews} 
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