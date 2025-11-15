// src/app/admin/content/home/featured/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSiteContent, updateSiteContent, type SiteContentMetadata, type HomeSection } from '@/app/actions/siteContentActions';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface FeaturedItem {
  id: string;
  name: string;
  type: 'property' | 'post';
  imageUrl?: string;
}

export default function FeaturedItemsPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [allProperties, setAllProperties] = useState<FeaturedItem[]>([]);
  const [allPosts, setAllPosts] = useState<FeaturedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load sections from database
        const homeContent = await getSiteContent('home');
        
        // Fetch all properties and posts
        const [propertiesRes, postsRes] = await Promise.all([
          fetch('/api/properties'),
          fetch('/api/posts'),
        ]);

        const allPropertiesData = await propertiesRes.json();
        const allPostsData = await postsRes.json();

        // Map to FeaturedItem format
        const propertiesList: FeaturedItem[] = allPropertiesData.map((p: { id: string; name: string; imageUrls?: string[] }) => ({
          id: p.id,
          name: p.name,
          type: 'property' as const,
          imageUrl: p.imageUrls?.[0],
        }));

        const postsList: FeaturedItem[] = allPostsData
          .filter((p: { published?: boolean }) => p.published)
          .map((p: { id: string; title: string; imageUrl?: string | null }) => ({
            id: p.id,
            name: p.title,
            type: 'post' as const,
            imageUrl: p.imageUrl,
          }));

        setAllProperties(propertiesList);
        setAllPosts(postsList);

        // Load sections from metadata
        if (homeContent?.metadata) {
          const metadata: SiteContentMetadata = JSON.parse(homeContent.metadata);
          
          if (metadata.sections && Array.isArray(metadata.sections)) {
            // Use new sections system
            setSections(metadata.sections.sort((a, b) => a.order - b.order));
          } else {
            // Migrate from old system (backward compatibility)
            const migratedSections: HomeSection[] = [];
            
            if (metadata.featuredProperties && metadata.featuredProperties.length > 0) {
              migratedSections.push({
                id: `section-${Date.now()}-1`,
                title: 'Các tòa nhà nổi bật',
                type: 'property',
                itemIds: metadata.featuredProperties,
                order: 0,
              });
            }
            
            if (metadata.featuredPosts && metadata.featuredPosts.length > 0) {
              migratedSections.push({
                id: `section-${Date.now()}-2`,
                title: 'Tin tức nổi bật',
                type: 'post',
                itemIds: metadata.featuredPosts,
                order: 1,
              });
            }
            
            setSections(migratedSections);
          }
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addSection = () => {
    const newSection: HomeSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Section mới',
      type: 'property',
      itemIds: [],
      order: sections.length,
      content: undefined,
    };
    
    // Auto-select default items if available (only for property/post types)
    const defaultItems: string[] = [];
    if (newSection.type === 'property' && allProperties.length > 0) {
      // Take first 9 properties as default
      defaultItems.push(...allProperties.slice(0, 9).map(p => p.id));
    } else if (newSection.type === 'post' && allPosts.length > 0) {
      // Take first 6 posts as default
      defaultItems.push(...allPosts.slice(0, 6).map(p => p.id));
    }
    
    newSection.itemIds = defaultItems;
    
    setSections([...sections, newSection]);
    setEditingSectionId(newSection.id);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    if (editingSectionId === sectionId) {
      setEditingSectionId(null);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<HomeSection>) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      // Update order
      newSections.forEach((s, i) => {
        s.order = i;
      });
      setSections(newSections);
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      // Update order
      newSections.forEach((s, i) => {
        s.order = i;
      });
      setSections(newSections);
    }
  };

  const addItemToSection = (sectionId: string, item: FeaturedItem) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section && section.type === item.type && !section.itemIds.includes(item.id)) {
      updateSection(sectionId, {
        itemIds: [...section.itemIds, item.id],
      });
    }
  };

  const removeItemFromSection = (sectionId: string, itemId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      updateSection(sectionId, {
        itemIds: section.itemIds.filter((id) => id !== itemId),
      });
    }
  };

  const moveItemInSection = (sectionId: string, itemIndex: number, direction: 'up' | 'down') => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newItemIds = [...section.itemIds];
    if (direction === 'up' && itemIndex > 0) {
      [newItemIds[itemIndex - 1], newItemIds[itemIndex]] = [newItemIds[itemIndex], newItemIds[itemIndex - 1]];
      updateSection(sectionId, { itemIds: newItemIds });
    } else if (direction === 'down' && itemIndex < newItemIds.length - 1) {
      [newItemIds[itemIndex], newItemIds[itemIndex + 1]] = [newItemIds[itemIndex + 1], newItemIds[itemIndex]];
      updateSection(sectionId, { itemIds: newItemIds });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const homeContent = await getSiteContent('home');
      const existingMetadata: SiteContentMetadata = homeContent?.metadata
        ? JSON.parse(homeContent.metadata)
        : {};

      const metadata: SiteContentMetadata = {
        ...existingMetadata,
        sections: sections.map((s) => ({ ...s, order: sections.indexOf(s) })),
        // Remove old fields for cleaner data
        featuredProperties: undefined,
        featuredPosts: undefined,
      };

      await updateSiteContent('home', {
        metadata,
      });

      toast.success('Đã cập nhật các section thành công!');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Sections trang Home</h1>
            <p className="text-sm text-gray-600 mt-1">Thêm/bớt và sắp xếp các section hiển thị trên trang home</p>
          </div>
          <Link
            href="/admin/content/home"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Quay lại chỉnh sửa Home
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sections List */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Chưa có section nào. Hãy thêm section đầu tiên!</p>
            </div>
          ) : (
            sections.map((section, sectionIndex) => {
              const sectionItems = section.type === 'property'
                ? allProperties.filter((p) => section.itemIds.includes(p.id))
                : allPosts.filter((p) => section.itemIds.includes(p.id));
              
              const availableItems = section.type === 'property'
                ? allProperties.filter((p) => !section.itemIds.includes(p.id))
                : allPosts.filter((p) => !section.itemIds.includes(p.id));

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        {sectionIndex + 1}.
                      </span>
                      {editingSectionId === section.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Tên section..."
                          />
                          <select
                            value={section.type}
                            onChange={(e) => {
                              const newType = e.target.value as 'property' | 'post' | 'html';
                              updateSection(section.id, {
                                type: newType,
                                itemIds: newType === 'html' ? [] : section.itemIds, // Clear items if switching to HTML
                                content: newType !== 'html' ? undefined : section.content, // Clear content if switching away from HTML
                              });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="property">Tòa nhà</option>
                            <option value="post">Tin tức</option>
                            <option value="html">HTML tùy chỉnh</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setEditingSectionId(null)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                          >
                            Xong
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                          <span className="text-sm text-gray-500">
                            ({section.type === 'property' ? 'Tòa nhà' : section.type === 'post' ? 'Tin tức' : 'HTML'})
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingSectionId(section.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Sửa
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveSection(sectionIndex, 'up')}
                        disabled={sectionIndex === 0}
                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(sectionIndex, 'down')}
                        disabled={sectionIndex === sections.length - 1}
                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Di chuyển xuống"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Xóa section"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* HTML Content Editor */}
                  {section.type === 'html' && (
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        HTML Content
                      </label>
                      <textarea
                        value={section.content || ''}
                        onChange={(e) => updateSection(section.id, { content: e.target.value })}
                        rows={15}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="<div>Nhập HTML của bạn ở đây...</div>"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Nhập HTML tùy chỉnh cho section này. Bạn có thể tạo slide công ty tin dùng, gallery ảnh, giới thiệu dịch vụ, v.v.
                      </p>
                    </div>
                  )}

                  {/* Section Items (only for property/post types) */}
                  {section.type !== 'html' && (
                    <div className="space-y-3 mb-4">
                      {sectionItems.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Nếu không có item nào trong section, item sẽ được lấy mặc định được đăng gần nhất</p>
                      ) : (
                        sectionItems.map((item, itemIndex) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm font-medium text-gray-500 w-6">
                              {itemIndex + 1}.
                            </span>
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900 flex-1">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => moveItemInSection(section.id, itemIndex, 'up')}
                              disabled={itemIndex === 0}
                              className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Di chuyển lên"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItemInSection(section.id, itemIndex, 'down')}
                              disabled={itemIndex === sectionItems.length - 1}
                              className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Di chuyển xuống"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItemFromSection(section.id, item.id)}
                              className="p-1.5 text-red-600 hover:text-red-800"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                      )}
                    </div>
                  )}

                  {/* Add Item Dropdown (only for property/post types) */}
                  {section.type !== 'html' && availableItems.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thêm {section.type === 'property' ? 'tòa nhà' : 'tin tức'}:
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const item = availableItems.find((i) => i.id === e.target.value);
                            if (item) addItemToSection(section.id, item);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Chọn {section.type === 'property' ? 'tòa nhà' : 'tin tức'} --</option>
                        {availableItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Section Button */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={addSection}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            + Thêm Section mới
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </>
  );
}
