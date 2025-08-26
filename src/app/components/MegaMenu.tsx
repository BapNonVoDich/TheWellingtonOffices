// src/app/components/MegaMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Ward, District } from '@prisma/client';
import { slugify } from '@/lib/utils';

export type DistrictWithWards = District & { 
  wards: Ward[] 
};

interface MegaMenuProps {
  title: string;
  items: DistrictWithWards[];
}

export default function MegaMenu({ title, items }: MegaMenuProps) {
  const [activeDistrict, setActiveDistrict] = useState<DistrictWithWards | null>(null);

  return (
    <div 
      className="relative group"
      onMouseLeave={() => setActiveDistrict(null)}
    >
      <button className="inline-flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium focus:outline-none">
        <span>{title}</span>
        <svg className="ml-2 -mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>
      
      <div className="origin-top-left absolute left-0 mt-2 w-[40rem] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="grid grid-cols-3">
          {/* Cot 1: Danh sach Quan */}
          <div className="col-span-1 border-r border-gray-200 py-2 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/van-phong-cho-thue/${slugify(item.name)}`} // <-- Đã sửa URL cho Quận
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold"
                onMouseEnter={() => setActiveDistrict(item)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Cot 2: Danh sach Phuong */}
          <div className="col-span-2 py-2 max-h-96 overflow-y-auto">
            {activeDistrict && activeDistrict.wards.length > 0 ? (
              activeDistrict.wards.map((ward) => (
                <Link
                  key={ward.id}
                  href={`/van-phong-cho-thue/${slugify(activeDistrict.name)}/${slugify(ward.name)}`} // <-- Đã sửa URL cho Phường
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {ward.name}
                </Link>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500 flex items-center justify-center h-full">
                Di chuột qua một quận để xem các phường
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}