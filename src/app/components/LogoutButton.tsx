// src/app/components/LogoutButton.tsx
'use client';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-600"
    >
      Đăng xuất
    </button>
  );
}