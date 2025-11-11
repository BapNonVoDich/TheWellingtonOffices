// src/app/components/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Grade, OfficeType, District, Ward, OldWard } from '@prisma/client';
import NestedMegaMenu from './NestedMegaMenu';
import DropdownMenu from './DropdownMenu'; // Giả sử bạn vẫn còn component này cho Hạng và Loại

interface HeaderProps {
  districts: (District & { wards: Ward[]; oldWards: OldWard[] })[];
}

export default function Header({ districts }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dữ liệu cho các dropdown
  const gradeItems = Object.values(Grade).map(g => ({
    href: `/tim-van-phong?grade=${g}`,
    label: `Hạng ${g}`,
  }));

  const typeItems = Object.values(OfficeType).map(t => ({
    href: `/tim-van-phong?type=${t}`,
    label: t === 'TRADITIONAL' ? 'Truyền thống' : 'Trọn gói',
  }));

  return (
    <header className="fixed top-0 left-0 right-0 h-[104px] z-50">
      {/* Thanh top bar */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
            {/* THAY ĐỔI 1: Tối ưu hiển thị contact info trên mobile */}
            <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                <span>Hotline: 097 1777213</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                <span>thewellingtonoffice@gmail.com</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/ky-gui" className="hover:text-gray-300">Ký gửi</Link>
              <Link href="/tin-tuc" className="hover:text-gray-300">Tin tức</Link>
              <Link href="/ve-chung-toi" className="hover:text-gray-300">Về chúng tôi</Link>
              <Link href="/lien-he" className="hover:text-gray-300">Liên hệ</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh điều hướng chính */}
      <div className="bg-white shadow-md h-[64px]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                The Wellington Offices
              </Link>
            </div>
            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-1 text-base">
              <NestedMegaMenu 
                title="Theo Quận/Phường" 
                districts={districts}
              />
              <DropdownMenu title="Theo Hạng" items={gradeItems} />
              <DropdownMenu title="Theo Loại" items={typeItems} />
              <Link href="/tim-van-phong" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 ml-4">
                Tìm kiếm Nâng cao
              </Link>
            </div>
            {/* Menu Mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Mở menu chính</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* THAY ĐỔI 2: Cập nhật Panel Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute w-full bg-white shadow-lg z-40">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/tim-toa-nha" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium">Tìm Tòa nhà</Link>
              <Link href="/tim-van-phong" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium">Tìm Văn phòng</Link>
              <div className="border-t border-gray-200 my-2"></div>
              <Link href="/ky-gui" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium">Ký gửi</Link>
              <Link href="/tin-tuc" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium">Tin tức</Link>
              <Link href="/ve-chung-toi" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium">Về chúng tôi</Link>
              <Link href="/lien-he" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium">Liên hệ</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}