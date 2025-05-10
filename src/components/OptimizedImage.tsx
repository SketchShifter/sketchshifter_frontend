'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes,
  priority = false,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // サムネイルのフォールバック
  const ThumbnailFallback = () => (
    <div className={`flex items-center justify-center bg-gray-200 text-gray-400 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-1/3 w-1/3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    </div>
  );

  // srcがない、または画像エラーの場合はフォールバックを表示
  if (!src || imageError) {
    return <ThumbnailFallback />;
  }

  // CloudinaryのURL最適化
  const optimizeCloudinaryUrl = (url: string) => {
    // すでにCloudinaryの最適化URLの場合はそのまま返す
    if (url.includes('/image/')) {
      return url;
    }

    // CloudinaryのURLを最適化
    if (url.includes('res.cloudinary.com')) {
      // クエリパラメータを削除
      const cleanUrl = url.split('?')[0];

      // 画像変換オプションを追加
      const transformations = 'f_auto,q_auto';

      // URLを組み立て直す
      const urlParts = cleanUrl.split('/upload/');
      if (urlParts.length === 2) {
        return `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
      }
    }

    return url;
  };

  // 最適化されたURLを取得
  const optimizedSrc = optimizeCloudinaryUrl(src);

  const imageProps = {
    src: optimizedSrc,
    alt,
    className: `${className} ${isLoading ? 'blur-sm' : ''}`,
    onLoad: () => setIsLoading(false),
    onError: () => {
      setImageError(true);
      setIsLoading(false);
    },
    priority,
    ...(fill ? { fill: true, sizes } : { width, height }),
  };

  return <Image {...imageProps} />;
}
