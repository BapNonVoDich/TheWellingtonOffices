// src/app/lien-he/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liên hệ | The Wellington Offices',
  description: 'Liên hệ với chúng tôi để được tư vấn về văn phòng cho thuê.',
};

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Liên hệ với chúng tôi</h1>
        <p className="mt-4 text-lg text-gray-600">Chúng tôi luôn sẵn sàng lắng nghe. Hãy để lại lời nhắn và chúng tôi sẽ phản hồi sớm nhất có thể.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột thông tin */}
        <div className="md:col-span-1 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin liên hệ</h2>
          <div className="space-y-4 text-gray-700">
            <p><strong>Địa chỉ:</strong> 123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM</p>
            <p><strong>Hotline:</strong> 097 1777213</p>
            <p><strong>Email:</strong> thewellingtonoffice@gmail.com</p>
            <p><strong>Giờ làm việc:</strong> T2 - T6: 8:00 - 18:00</p>
          </div>
        </div>

        {/* Cột Form */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-md">
           <h2 className="text-2xl font-bold text-gray-800 mb-4">Gửi yêu cầu tư vấn</h2>
           <form action="#" method="POST" className="space-y-6">
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
              <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700">
                      Gửi đi
                  </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}