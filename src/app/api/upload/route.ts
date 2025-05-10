// // app/api/upload/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { v2 as cloudinary } from 'cloudinary';
// import { UploadApiOptions } from 'cloudinary';

// // Cloudinaryの設定
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File;
//     const folder = (formData.get('folder') as string) || 'sketchshifter';
//     const resourceType =
//       (formData.get('resource_type') as 'image' | 'raw' | 'auto' | 'video') || 'image';
//     const compressionQuality = parseInt((formData.get('quality') as string) || '50');

//     if (!file) {
//       return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 });
//     }

//     // ファイルをArrayBufferに変換
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Base64エンコード
//     const base64 = buffer.toString('base64');
//     const fileType = file.type;
//     const dataURI = `data:${fileType};base64,${base64}`;

//     // Cloudinaryにアップロード
//     const uploadOptions: UploadApiOptions = {
//       folder,
//       resource_type: resourceType,
//       quality: compressionQuality,
//       // ランダムなパブリックIDを生成
//       public_id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
//       format: 'webp', // WebP に変換（小さいサイズ）
//     };

//     const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

//     return NextResponse.json({
//       success: true,
//       public_id: result.public_id,
//       secure_url: result.secure_url,
//     });
//   } catch (error) {
//     console.error('Cloudinaryアップロードエラー:', error);
//     return NextResponse.json({ error: 'ファイルのアップロードに失敗しました' }, { status: 500 });
//   }
// }
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
    const compressionQuality = parseInt((formData.get('quality') as string) || '75');

    if (!file) {
      return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 });
    }

    // ファイルをArrayBufferに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinaryへのアップロード
    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: resourceType,
      // quality_autoを使用して自動品質最適化
      quality: resourceType === 'image' ? 'auto' : undefined,
      // ランダムなパブリックIDを生成
      public_id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      // WebP形式に変換（より小さいファイルサイズ）
      format: resourceType === 'image' ? 'png' : undefined,
      // 画像の最大サイズを設定
      transformation:
        resourceType === 'image'
          ? [
              {
                width: 1920,
                height: 1080,
                crop: 'limit',
              },
            ]
          : undefined,
    };

    // ストリームとしてアップロード
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });

      // バッファをストリームに書き込む
      uploadStream.end(buffer);
    });

    // アップロード結果をキャストして型安全にする
    const uploadResult = result as {
      public_id: string;
      secure_url: string;
      format: string;
      width: number;
      height: number;
      bytes: number;
    };

    console.log('Cloudinary Upload Success:', {
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      format: uploadResult.format,
      size: `${uploadResult.width}x${uploadResult.height}`,
      bytes: uploadResult.bytes,
    });

    return NextResponse.json({
      success: true,
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      size: uploadResult.bytes,
    });
  } catch (error) {
    console.error('Cloudinaryアップロードエラー:', error);

    // エラーの詳細情報を返す
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'ファイルのアップロードに失敗しました',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'ファイルのアップロードに失敗しました' }, { status: 500 });
  }
}
