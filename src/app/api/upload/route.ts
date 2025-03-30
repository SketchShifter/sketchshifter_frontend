// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiOptions } from 'cloudinary';

// Cloudinaryの設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'sketchshifter';
    const resourceType =
      (formData.get('resource_type') as 'image' | 'raw' | 'auto' | 'video') || 'image';
    const compressionQuality = parseInt((formData.get('quality') as string) || '50');

    if (!file) {
      return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 });
    }

    // ファイルをArrayBufferに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Base64エンコード
    const base64 = buffer.toString('base64');
    const fileType = file.type;
    const dataURI = `data:${fileType};base64,${base64}`;

    // Cloudinaryにアップロード
    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: resourceType,
      quality: compressionQuality,
      // ランダムなパブリックIDを生成
      public_id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      format: 'webp', // WebP に変換（小さいサイズ）
    };

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
    });
  } catch (error) {
    console.error('Cloudinaryアップロードエラー:', error);
    return NextResponse.json({ error: 'ファイルのアップロードに失敗しました' }, { status: 500 });
  }
}
