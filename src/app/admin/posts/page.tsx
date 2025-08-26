// src/app/admin/posts/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { deletePost } from '@/app/actions/postActions';
import type { Post, Employee } from '@prisma/client';
import toast from 'react-hot-toast';

// Dinh nghia kieu du lieu de TypeScript hieu ro
type PostWithAuthor = Post & { author: Employee };

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      toast.error('Không thể tải danh sách bài viết.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = () => {
    if (!postToDelete) return;
    
    startTransition(async () => {
      try {
        await deletePost(postToDelete.id);
        toast.success('Đã xóa bài viết thành công!');
        setPostToDelete(null); // Dong modal
        fetchPosts(); // Tai lai danh sach
      } catch (error) {
        toast.error(`Lỗi khi xóa: ${(error as Error).message}`);
      }
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Đang tải danh sách bài viết...</div>;
  }

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Tin tức</h1>
          <Link href="/admin/posts/new" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            + Viết bài mới
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6">Tiêu đề</th>
                <th scope="col" className="py-3 px-6">Tác giả</th>
                <th scope="col" className="py-3 px-6">Trạng thái</th>
                <th scope="col" className="py-3 px-6">Ngày tạo</th>
                <th scope="col" className="py-3 px-6">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">{post.title}</td>
                  <td className="py-4 px-6">{post.author.name}</td>
                  <td className="py-4 px-6">
                    {post.published ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Xuất bản</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Bản nháp</span>
                    )}
                  </td>
                  <td className="py-4 px-6">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="py-4 px-6 space-x-2 whitespace-nowrap">
                    <Link href={`/admin/posts/edit/${post.id}`} className="text-blue-600 hover:underline">Sửa</Link>
                    <button onClick={() => setPostToDelete(post)} className="text-red-600 hover:underline">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal Xóa */}
      {postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl z-50 max-w-sm w-full">
                <h3 className="text-lg font-bold">Xác nhận Xóa</h3>
                <p className="py-4">Bạn có chắc chắn muốn xóa bài viết "{postToDelete.title}" không?</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setPostToDelete(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Hủy</button>
                    <button onClick={handleDelete} disabled={isPending} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400">
                        {isPending ? 'Đang xóa...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}