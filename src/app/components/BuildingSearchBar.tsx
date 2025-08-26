// src/app/components/BuildingSearchBar.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Grade } from '@prisma/client'; // Import enum Grade tu Prisma

// Dinh nghia type cho du lieu locations
type Ward = { id: string; name: string };
type District = { id: string; name: string; wards: Ward[] };

export default function BuildingSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('districtId') || '');
    const [selectedWard, setSelectedWard] = useState(searchParams.get('wardId') || '');
    const [grade, setGrade] = useState(searchParams.get('grade') || '');

    useEffect(() => {
        fetch('/api/locations').then(res => res.json()).then(data => setDistricts(data));
    }, []);

    useEffect(() => {
        if (selectedDistrict) {
            const district = districts.find(d => d.id === selectedDistrict);
            setWards(district?.wards || []);
        } else {
            setWards([]);
        }
    }, [selectedDistrict, districts]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (selectedDistrict) params.set('districtId', selectedDistrict);
        if (selectedWard) params.set('wardId', selectedWard);
        if (grade) params.set('grade', grade);
        
        startTransition(() => {
            router.push(`/tim-toa-nha?${params.toString()}`);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
              <select
                id="district"
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedWard('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Tất cả Quận/Huyện</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
              <select
                id="ward"
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                disabled={!selectedDistrict}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-200"
              >
                <option value="">Tất cả Phường/Xã</option>
                {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            {/* THAY ĐỔI: Cập nhật dropdown cho Hạng */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Hạng</label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Tất cả</option>
                {/* Lấy giá trị động từ enum Grade */}
                {Object.values(Grade).map(g => (
                  <option key={g} value={g}>
                    {g === 'OTHER' ? 'Khác' : `Hạng ${g}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition-colors w-full disabled:bg-gray-400"
              >
                {isPending ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>
          </form>
        </div>
    )
}