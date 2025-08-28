// src/app/actions/contactActions.ts
'use server';

import { Resend } from 'resend';
import ContactFormEmail from '@/emails/ContactFormEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const initialState = {
  message: '',
  success: false,
};

export async function handleContactSubmit(prevState: typeof initialState, formData: FormData) {
  const submission = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    message: formData.get('message') as string,
  };

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'thewellingtonoffice@gmail.com',
      subject: `Tin nhắn liên hệ mới từ ${submission.name}`,
      react: <ContactFormEmail {...submission} />
    });
    return { success: true, message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' };
  }
}