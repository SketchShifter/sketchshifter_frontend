'use client';

import WorksCard from '@/components/workscard';
import Link from 'next/link';
import { useMyWorks } from '@/hooks/use-my-works';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';

export default function MyListPage() {
  const { data: works, isLoading, error } = useMyWorks();
  const { isAuthReady, isAuthenticated } = useCurrentUser();
  const token = useAuthStore((state) => state.token);

  // 認証チェックが完了していない場合はローディング表示
  if (!isAuthReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">マイ作品リスト</h1>
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  // 認証されていない場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated || !token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">マイ作品リスト</h1>
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">マイ作品リスト</h1>
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
          <h2 className="mb-4 text-xl font-bold">エラーが発生しました</h2>
          <p>{error instanceof Error ? error.message : '作品の取得に失敗しました'}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">マイ作品リスト</h1>
        <Link
          href="/mylist/submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          作品を作成
        </Link>
      </div>

      {works && works.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {works.map((work) => (
            <WorksCard
              key={work.id}
              id={work.id}
              title={work.title}
              date={work.created_at}
              description={work.description}
              username={work.user?.nickname || 'Unknown'}
              thumbnail={work.thumbnail_url || '/placeholder-image.jpg'}
              views={work.views}
              likes_count={work.likes_count}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="mb-2 text-xl font-medium text-gray-900">まだ作品がありません</h2>
          <p className="mb-4 text-gray-600">最初の作品を作成してみましょう。</p>
          <Link
            href="/create"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            作品を作成
          </Link>
        </div>
      )}
    </div>
  );
}
