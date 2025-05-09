'use client';

import HomeGallery from '@/components/home-gallery';
import { useWorks } from '@/hooks/use-works';

export default function ArtworksPage() {
  // TanStack Queryを使用して作品データを取得
  const { data, isLoading, isError, error } = useWorks();

  // エラーハンドリング
  if (isError) {
    console.error('データの取得に失敗しました:', error);
  }

  return (
    <div className="mt-4 mb-10">
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <HomeGallery data={data || { works: [] }} />
      )}
    </div>
  );
}
