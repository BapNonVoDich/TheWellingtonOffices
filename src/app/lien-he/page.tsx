// src/app/lien-he/page.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleContactSubmit } from '@/app/actions/contactActions';
import { getSiteContent, type SiteContentMetadata } from '@/app/actions/siteContentActions';
import { useEffect, useState } from 'react';

const initialState = {
  message: '',
  success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {pending ? 'Đang gửi...' : 'Gửi đi'}
        </button>
    )
}

export default function ContactPage() {
  const [state, formAction] = useFormState(handleContactSubmit, initialState);
  const [contactInfo, setContactInfo] = useState<{
    title: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    workingHours: string;
  }>({
    title: 'Liên hệ với chúng tôi',
    description: 'Chúng tôi luôn sẵn sàng lắng nghe. Hãy để lại lời nhắn và chúng tôi sẽ phản hồi sớm nhất có thể.',
    address: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
    phone: '097 1777213',
    email: 'thewellingtonoffice@gmail.com',
    workingHours: 'T2 - T6: 8:00 - 18:00',
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getSiteContent('contact');
        if (content) {
          const metadata: SiteContentMetadata = content.metadata ? JSON.parse(content.metadata) : {};
          setContactInfo((prev) => ({
            title: content.title || prev.title,
            description: content.description || prev.description,
            address: metadata.address || prev.address,
            phone: metadata.phone || prev.phone,
            email: metadata.email || prev.email,
            workingHours: metadata.workingHours || prev.workingHours,
          }));
        }
      } catch (error) {
        console.error('Error loading contact content:', error);
      }
    };
    loadContent();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">{contactInfo.title}</h1>
        <p className="mt-4 text-lg text-gray-600">{contactInfo.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột thông tin */}
        <div className="md:col-span-1 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin liên hệ</h2>
          <div className="space-y-4 text-gray-700">
            <p><strong>Địa chỉ:</strong> {contactInfo.address}</p>
            <p><strong>Hotline:</strong> {contactInfo.phone}</p>
            <p><strong>Email:</strong> {contactInfo.email}</p>
            <p><strong>Giờ làm việc:</strong> {contactInfo.workingHours}</p>
          </div>
        </div>

        {/* Cột Form */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-md">
           <h2 className="text-2xl font-bold text-gray-800 mb-4">Gửi yêu cầu tư vấn</h2>
           <form action={formAction} className="space-y-6">
              <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                  <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
               <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input type="tel" name="phone" id="phone" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Nội dung yêu cầu</label>
                  <textarea name="message" id="message" rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              </div>
               {state.message && (
                 <p className={`${state.success ? 'text-green-600' : 'text-red-600'} text-sm font-semibold`}>
                    {state.message}
                 </p>
              )}
              <div className="flex justify-end">
                  <SubmitButton />
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}