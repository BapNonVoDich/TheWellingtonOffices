// src/app/actions/consignmentActions.ts
'use server';

const initialState = {
  message: '',
  success: false,
};

export async function handleConsignmentSubmit(prevState: typeof initialState, formData: FormData) {
  const submission = {
    contactName: formData.get('contactName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    propertyAddress: formData.get('propertyAddress'),
    propertyType: formData.get('propertyType'),
    area: formData.get('area'),
    price: formData.get('price'),
    description: formData.get('description'),
  };

  console.log("New Consignment Submission:", submission);

  // Xử lý logic ở đây (ví dụ: lưu vào DB, gửi email,...)
  // ...

  return { success: true, message: 'Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.' };
}