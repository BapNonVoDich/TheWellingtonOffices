// src/app/components/NestedMegaMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Ward, District, OldWard } from '@prisma/client';
import { slugify } from '@/lib/utils';

export type DistrictWithWards = District & { 
  wards: Ward[];
  oldWards: OldWard[];
};

interface NestedMegaMenuProps {
  title: string;
  districts: DistrictWithWards[];
}

export default function NestedMegaMenu({ title, districts }: NestedMegaMenuProps) {
  const [activeSubMenu, setActiveSubMenu] = useState<'old' | 'new' | null>(null);
  const [activeDistrict, setActiveDistrict] = useState<DistrictWithWards | null>(null);

  return (
    <div 
      className="relative group"
      onMouseLeave={() => {
        setActiveSubMenu(null);
        setActiveDistrict(null);
      }}
    >
      <button className="inline-flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium focus:outline-none">
        <span>{title}</span>
        <svg className="ml-2 -mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* First level dropdown: Địa chỉ cũ and Địa chỉ mới */}
      <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-1">
          <div
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer"
            onMouseEnter={() => setActiveSubMenu('old')}
          >
            Địa chỉ cũ
          </div>
          <div
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer"
            onMouseEnter={() => setActiveSubMenu('new')}
          >
            Địa chỉ mới
          </div>
        </div>
      </div>

      {/* Second level mega menu: Districts and Wards/OldWards */}
      {activeSubMenu && (
        <div 
          className="origin-top-left absolute left-48 mt-0 w-[40rem] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          onMouseLeave={() => setActiveDistrict(null)}
        >
          <div className="grid grid-cols-3">
            {/* Column 1: Districts */}
            <div className="col-span-1 border-r border-gray-200 py-2 max-h-96 overflow-y-auto">
              {districts.map((district) => (
                <Link
                  key={district.id}
                  href={activeSubMenu === 'old' 
                    ? `/van-phong-cho-thue/${slugify(district.name)}`
                    : `/van-phong-cho-thue/dia-chi-moi/${slugify(district.name)}`
                  }
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold"
                  onMouseEnter={() => setActiveDistrict(district)}
                >
                  {district.name}
                </Link>
              ))}
            </div>

            {/* Column 2: Wards/OldWards */}
            <div className="col-span-2 py-2 max-h-96 overflow-y-auto">
              {activeDistrict && activeSubMenu === 'old' && activeDistrict.oldWards.length > 0 ? (
                activeDistrict.oldWards.map((oldWard) => (
                  <Link
                    key={oldWard.id}
                    href={`/van-phong-cho-thue/${slugify(activeDistrict.name)}/${slugify(oldWard.name)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {oldWard.name}
                  </Link>
                ))
              ) : activeDistrict && activeSubMenu === 'new' && activeDistrict.wards.length > 0 ? (
                activeDistrict.wards.map((ward) => (
                  <Link
                    key={ward.id}
                    href={`/van-phong-cho-thue/dia-chi-moi/${slugify(ward.name)}`}
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
      )}
    </div>
  );
}

