// sketchshifter_frontend/src/app/users/[userId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import WorksCard from '@/components/workscard';
import { workToCardProps } from '@/types/dataTypes';
import { UsersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { AuthUser } from '@/types/dataTypes';
import { useUserWorks } from '@/hooks/use-work-hooks';
import Image from 'next/image';
import {
  UserIcon,
  CalendarIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function UserPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [page, setPage] = useState(1);
  const [userInfo, setUserInfo] = useState<AuthUser | null>(null);
  const { token } = useAuthStore();

  const { data, isLoading, error } = useUserWorks(userId, page);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await UsersApi.getProfile(userId, token || undefined);
        setUserInfo(response.user);
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
      }
    };

    fetchUserInfo();
  }, [userId, token]);

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">読み込み中...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center">エラーが発生しました</div>;
  }

  if (!data || !data.works || data.works.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="mb-6 text-2xl font-bold">
          {userInfo?.nickname || userInfo?.name || 'ユーザー'}の作品
        </h1>
        <p className="text-center text-gray-500">このユーザーはまだ作品を投稿していません</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ユーザー情報 */}
      <div className="mb-8 overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
            {userInfo?.avatar_url ? (
              <Image
                src={userInfo.avatar_url}
                alt={userInfo?.nickname || userInfo?.name || 'ユーザー'}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white">
                <UserIcon className="h-12 w-12" />
              </div>
            )}
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {userInfo?.nickname || userInfo?.name || 'ユーザー'}
            </h1>
            {userInfo?.bio && <p className="mb-4 leading-relaxed text-gray-700">{userInfo.bio}</p>}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                {userInfo?.created_at
                  ? new Date(userInfo.created_at).toLocaleDateString('ja-JP')
                  : '不明'}
              </span>
              <span className="flex items-center">
                <PhotoIcon className="mr-1 h-4 w-4" />
                {data.total} 作品
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 作品一覧 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">投稿作品</h2>
        <span className="rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-800">
          {data.total} 作品
        </span>
      </div>

      {data.works && data.works.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.works.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <WorksCard {...workToCardProps(work)} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="mb-2 text-xl font-medium text-gray-900">まだ作品がありません</h2>
          <p className="mb-4 text-gray-600">このユーザーはまだ作品を投稿していません。</p>
        </div>
      )}

      {/* ページネーション */}
      {data.pages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeftIcon className="mr-1 h-4 w-4" />
              前へ
            </button>

            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  p === page ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, data.pages))}
              disabled={page === data.pages}
              className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              次へ
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
