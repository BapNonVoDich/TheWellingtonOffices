// src/app/components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">The Wellington Offices</h3>
            <p className="text-base leading-relaxed">
              Nền tảng tìm kiếm và cho thuê văn phòng hàng đầu, cung cấp giải pháp không gian làm việc tối ưu cho doanh nghiệp của bạn tại TP.HCM và các khu vực lân cận.
            </p>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Kết nối với chúng tôi</h3>
            <div className="space-y-4 text-base">
              <p><strong>Địa chỉ:</strong> 123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM</p>
              <p><strong>Giờ làm việc:</strong> T2 - T6: 8:00 - 18:00</p>
              <p><strong>Hotline:</strong> 097 1777213</p>
              <p><strong>Email:</strong> thewellingtonoffice@gmail.com</p>
            </div>
          </div>

          {/* Social media */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Mạng xã hội</h3>
            <div className="flex space-x-4">
              {/* Facebook */}
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 
                  8.438 9.878v-6.987H8.077V12h2.36V9.797c0-2.337 
                  1.393-3.623 3.523-3.623.997 0 2.037.178 
                  2.037.178v2.25h-1.148c-1.132 0-1.486.704-1.486 
                  1.426V12h2.528l-.404 2.89h-2.124v6.988C18.343 
                  21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 
                  0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 
                  16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 
                  1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 
                  4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 
                  4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 
                  3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 
                  1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 
                  3.5 0 0 0 0-7zm5.25-2.25a1.25 1.25 0 1 
                  1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 
                  4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 
                  4.98 3.5zM0 8h5v15H0V8zm7.5 
                  0h4.7v2.2h.07c.65-1.2 2.24-2.45 
                  4.6-2.45 4.9 0 5.8 3.2 5.8 
                  7.4V23H17v-7.3c0-1.7-.03-3.9-2.4-3.9-2.4 
                  0-2.8 1.9-2.8 3.8V23H7.5V8z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="text-gray-400 hover:text-white" aria-label="TikTok">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c1.65 0 3 .35 4.24 
                  1.03.2 2.23 1.77 3.97 3.9 
                  4.29V10a7.02 7.02 0 0 1-3.9-1.17V15a7 
                  7 0 1 1-7-7v3.5a3.5 3.5 0 1 0 
                  2 3.17V2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-base">
          <p>&copy; 2025 The Wellington Offices. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
