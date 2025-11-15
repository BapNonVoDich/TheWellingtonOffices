// src/app/api/images/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import streamifier from 'streamifier';
import { auth } from '@/lib/auth';

// Cấu hình Cloudinary SDK với thông tin từ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validation constants
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadToCloudinary(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "thewellingtonoffices" },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );

    file.arrayBuffer()
      .then(buffer => {
        streamifier.createReadStream(Buffer.from(buffer)).pipe(uploadStream);
      })
      .catch(err => reject(err));
  });
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Additional validation: check if file is actually an image by reading first bytes
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Check for image file signatures (magic numbers)
    const isImage = 
      // JPEG: FF D8 FF
      (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) ||
      // PNG: 89 50 4E 47
      (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) ||
      // GIF: 47 49 46 38
      (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x38) ||
      // WEBP: Check for RIFF...WEBP
      (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
       uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50);

    if (!isImage) {
      return NextResponse.json(
        { error: "File is not a valid image" },
        { status: 400 }
      );
    }

    const secureUrl = await uploadToCloudinary(file);

    return NextResponse.json({ url: secureUrl }, { status: 201 });

  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}