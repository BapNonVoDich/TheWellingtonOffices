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
    
    // Cloudinary returns { result: 'ok' } on success, { result: 'not found' } if image doesn't exist
    if (result.result === 'ok') {
      console.log("Xóa ảnh thành công:", publicId);
      return { success: true };
    } else if (result.result === 'not found') {
      console.warn("Ảnh không tồn tại trên Cloudinary:", publicId);
      // Consider this a success since the goal is to remove the image
      return { success: true, warning: 'Image not found on Cloudinary' };
    } else {
      console.error("Lỗi khi xóa ảnh - kết quả không mong đợi:", result);
      return { success: false, error: `Unexpected result: ${result.result}` };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Lỗi khi xóa ảnh:", publicId, errorMessage);
    return { success: false, error: errorMessage };
  }
}