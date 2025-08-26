// src/app/admin/layout.tsx
import { auth } from '@/lib/auth'; // Su dung auth tu NextAuth v5
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton'; // Se tao o buoc sau

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // Lay session o server

  // Neu khong co session (chua dang nhap), da ve trang login
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/admin/dashboard" className="text-xl font-bold text-blue-600">Admin Dashboard</Link>
              <Link href="/admin/posts" className="text-sm font-medium text-gray-600 hover:text-gray-900">Quản lý Tin tức</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Chào, {session.user.name}</span>
              <LogoutButton />
            </div>
          </div>
        </nav>
      </header>
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}