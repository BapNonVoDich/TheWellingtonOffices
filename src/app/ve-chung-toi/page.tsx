// src/app/ve-chung-toi/page.tsx
import Image from 'next/image';
import type { Metadata } from 'next';
import { getSiteContent } from '@/app/actions/siteContentActions';

export const metadata: Metadata = {
  title: 'Về chúng tôi | The Wellington Offices',
  description: 'Tìm hiểu về The Wellington Offices, sứ mệnh và đội ngũ của chúng tôi.',
};

interface AboutContent {
  mission: {
    title: string;
    text: string;
  };
  team: {
    title: string;
    text: string;
  };
}

export default async function AboutUsPage() {
  const aboutContent = await getSiteContent('about');
  
  // Fallback values
  const title = aboutContent?.title || 'Về The Wellington Offices';
  const description = aboutContent?.description || 'Đối tác tin cậy của bạn trong lĩnh vực không gian làm việc linh hoạt và hiệu quả.';
  const backgroundImage = aboutContent?.imageUrl || '/images/BG.jpg';
  
  let missionTitle = 'Sứ mệnh của chúng tôi';
  let missionText = 'Mang đến không gian làm việc lý tưởng, hỗ trợ sự phát triển bền vững cho mọi doanh nghiệp. Chúng tôi cam kết cung cấp dịch vụ tận tâm và giải pháp tối ưu nhất.';
  let teamTitle = 'Đội ngũ của chúng tôi';
  let teamText = 'Đội ngũ The Wellington Offices là tập hợp những chuyên gia giàu kinh nghiệm và nhiệt huyết trong lĩnh vực bất động sản thương mại. Chúng tôi luôn nỗ lực để hiểu rõ nhu cầu của khách hàng và cung cấp những giải pháp phù hợp nhất.';
  
  if (aboutContent?.content) {
    try {
      const content: AboutContent = JSON.parse(aboutContent.content);
      if (content.mission) {
        missionTitle = content.mission.title || missionTitle;
        missionText = content.mission.text || missionText;
      }
      if (content.team) {
        teamTitle = content.team.title || teamTitle;
        teamText = content.team.text || teamText;
      }
    } catch (e) {
      // Use defaults if parsing fails
    }
  }

  return (
    <div className="relative bg-gray-100 overflow-hidden">
      {/* Lớp phủ (overlay) để làm dịu hình nền và tăng độ tương phản cho chữ */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-300 opacity-50" />
      
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            {description}
          </p>
        </div>
        
        <div className="mt-12">
          <div className="relative max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="relative w-full h-80 sm:h-96 md:h-[480px]">
              <Image
                src={backgroundImage}
                alt="Hình nền văn phòng hiện đại"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="px-8 py-12 text-center">
                <h3 className="text-3xl font-bold text-white mb-4">{missionTitle}</h3>
                <p className="mt-2 text-xl text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: missionText }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="relative max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-8 py-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{teamTitle}</h3>
              <p className="mt-2 text-lg text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: teamText }} />
              {/* Bạn có thể thêm thông tin về các thành viên trong đội ngũ ở đây */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}