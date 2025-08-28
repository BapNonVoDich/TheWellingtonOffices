// src/app/actions/consignmentActions.ts
'use server';

import { Resend } from 'resend';
import ConsignmentNotificationEmail from '@/emails/ConsignmentNotificationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const initialState = {
  message: '',
  success: false,
};

export async function handleConsignmentSubmit(prevState: typeof initialState, formData: FormData) {
  const submission = {
    contactName: formData.get('contactName') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    propertyAddress: formData.get('propertyAddress') as string,
    propertyType: formData.get('propertyType') as string,
    area: formData.get('area') as string,
    price: formData.get('price') as string,
    description: formData.get('description') as string,
  };

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Địa chỉ mặc định của Resend cho free tier
      to: 'thewellingtonoffice@gmail.com',
      subject: `Thông tin ký gửi mới từ ${submission.contactName}`,
      react: <ConsignmentNotificationEmail {...submission} />
    });
    return { success: true, message: 'Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' };
  }
}