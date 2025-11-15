'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Property, Office, Ward, District, Post } from '@prisma/client';

type PropertyWithRelations = Property & {
  ward: (Ward & { district: District }) | null;
  oldWard: ({ id: string; name: string; district: District }) | null;
  offices: Office[];
};

type PostWithAuthor = Post & {
  author: { name: string };
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    properties: 0,
    offices: 0,
    availableOffices: 0,
    posts: 0,
    publishedPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProperties, setRecentProperties] = useState<PropertyWithRelations[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostWithAuthor[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch properties
        const propertiesRes = await fetch('/api/properties');
        const properties = await propertiesRes.json();
        
        // Fetch posts
        const postsRes = await fetch('/api/posts');
        const posts = await postsRes.json();

        // Calculate stats
        const totalOffices = properties.reduce((sum: number, p: PropertyWithRelations) => sum + (p.offices?.length || 0), 0);
        const availableOffices = properties.reduce((sum: number, p: PropertyWithRelations) => 
          sum + (p.offices?.filter((o: Office) => o.isAvailable).length || 0), 0
        );

        setStats({
          properties: properties.length,
          offices: totalOffices,
          availableOffices,
          posts: posts.length,
          publishedPosts: posts.filter((p: PostWithAuthor) => p.published).length,
        });

        // Get recent items
        setRecentProperties(properties.slice(0, 5));
        setRecentPosts(posts.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Tổng quan về hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Tòa nhà</div>
          <div className="text-3xl font-bold text-gray-900">{stats.properties}</div>
          <Link href="/admin/properties" className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Xem tất cả →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Tổng văn phòng</div>
          <div className="text-3xl font-bold text-blue-600">{stats.offices}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Đang cho thuê</div>
          <div className="text-3xl font-bold text-green-600">{stats.availableOffices}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Bài viết</div>
          <div className="text-3xl font-bold text-purple-600">{stats.posts}</div>
          <Link href="/admin/posts" className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Xem tất cả →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Đã xuất bản</div>
          <div className="text-3xl font-bold text-indigo-600">{stats.publishedPosts}</div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tòa nhà gần đây</h2>
            <Link href="/admin/properties" className="text-sm text-blue-600 hover:text-blue-800">
              Xem tất cả →
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có tòa nhà nào</p>
          ) : (
            <ul className="space-y-3">
              {recentProperties.map((property) => (
                <li key={property.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <Link href={`/admin/properties/${property.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                      {property.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {property.ward ? (
                        <span>{property.ward.name}, {property.ward.district.name} <span className="text-gray-400">(Mới)</span></span>
                      ) : property.oldWard ? (
                        <span>{property.oldWard.name}, {property.oldWard.district.name} <span className="text-gray-400">(Cũ)</span></span>
                      ) : 'Chưa có địa chỉ'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{property.offices?.length || 0} VP</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bài viết gần đây</h2>
            <Link href="/admin/posts" className="text-sm text-blue-600 hover:text-blue-800">
              Xem tất cả →
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có bài viết nào</p>
          ) : (
            <ul className="space-y-3">
              {recentPosts.map((post) => (
                <li key={post.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <Link href={`/admin/posts/edit/${post.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {post.author.name} • {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  {post.published ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Đã xuất bản
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Bản nháp
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link
            href="/admin/properties/new"
            className="flex items-center px-4 py-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-blue-900">Thêm tòa nhà</span>
          </Link>
          <Link
            href="/admin/posts/new"
            className="flex items-center px-4 py-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-green-900">Viết bài mới</span>
          </Link>
          <Link
            href="/admin/properties"
            className="flex items-center px-4 py-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium text-purple-900">Quản lý tòa nhà</span>
          </Link>
          <Link
            href="/admin/posts"
            className="flex items-center px-4 py-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-medium text-indigo-900">Quản lý bài viết</span>
          </Link>
        </div>

        {/* Content Management Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý nội dung</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <Link
              href="/admin/content/home"
              className="flex items-center px-4 py-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium text-orange-900">Trang Home</span>
            </Link>
            <Link
              href="/admin/content/home/featured"
              className="flex items-center px-4 py-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm font-medium text-rose-900">Nổi bật Home</span>
            </Link>
            <Link
              href="/admin/content/contact"
              className="flex items-center px-4 py-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-teal-900">Trang Liên hệ</span>
            </Link>
            <Link
              href="/admin/content/about"
              className="flex items-center px-4 py-3 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-cyan-900">Về chúng tôi</span>
            </Link>
            <Link
              href="/admin/content/header"
              className="flex items-center px-4 py-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium text-pink-900">Header</span>
            </Link>
            <Link
              href="/admin/content/footer"
              className="flex items-center px-4 py-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span className="text-sm font-medium text-amber-900">Footer</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}