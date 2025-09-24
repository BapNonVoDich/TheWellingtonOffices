// src/app/actions/cloudinaryActions.ts
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Cấu hình Cloudinary SDK với thông tin từ .env
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Xóa ảnh ", publicId, " thành công:", result);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
    return { success: false, error: (error as Error).message };
  }
}