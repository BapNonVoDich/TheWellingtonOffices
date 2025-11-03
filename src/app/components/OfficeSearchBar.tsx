// src/app/components/OfficeSearchBar.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Grade } from '@prisma/client';

type Ward = { id: string; name: string };
type District = { id: string; name: string; wards: Ward[] };

export default function OfficeSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [districts, setDistricts] = useState<District[]>([]);

  // State cho cac o input
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('districtId') || '');
  const [minArea, setMinArea] = useState(searchParams.get('minArea') || '');
  const [maxArea, setMaxArea] = useState(searchParams.get('maxArea') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [grade, setGrade] = useState(searchParams.get('grade') || ''); // Moi
  const [type, setType] = useState(searchParams.get('type') || '');   // Moi

  useEffect(() => {
    fetch('/api/locations').then(res => res.json()).then(data => setDistricts(data));
  }, []);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (selectedDistrict) params.set('districtId', selectedDistrict);
    if (minArea) params.set('minArea', minArea);
    if (maxArea) params.set('maxArea', maxArea);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (grade) params.set('grade', grade); // Them vao params
    if (type) params.set('type', type);   // Them vao params
    
    startTransition(() => {
      router.push(`/tim-van-phong?${params.toString()}`);
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Cot 1 & 2: Vi tri & Loai hinh */}
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
            <select id="district" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">Tất cả</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Hạng</label>
            <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="">Tất cả</option>
                {Object.values(Grade).map(g => <option key={g} value={g}>Hạng {g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="">Tất cả</option>
                <option value="TRADITIONAL">Truyền thống</option>
                <option value="SERVICED">Trọn gói</option>
            </select>
          </div>
          
          {/* Cot 3 & 4: Dien tich & Gia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
            <div className="flex items-center space-x-2">
              <input type="number" value={minArea} onChange={(e) => setMinArea(e.target.value)} placeholder="Từ" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
              <input type="number" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} placeholder="Đến" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá ($/m²)</label>
            <div className="flex items-center space-x-2">
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Từ" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Đến" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isPending} className="bg-blue-600 text-white font-semibold px-8 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
            {isPending ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </form>
    </div>
  );
}