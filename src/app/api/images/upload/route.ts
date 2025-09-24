// src/app/api/images/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import streamifier from 'streamifier';

// Cấu hình Cloudinary SDK với thông tin từ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const secureUrl = await uploadToCloudinary(file);

    return NextResponse.json({ url: secureUrl }, { status: 201 });

  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}