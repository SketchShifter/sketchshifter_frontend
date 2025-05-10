'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/formatDate';
import { useMyWorks } from '@/hooks/use-work-hooks';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { CardProps } from '@/components/workscard';
import { motion } from 'framer-motion';

// マイリスト用のカードコンポーネント（編集リンク付き）
const MyWorkCard: React.FC<CardProps> = ({
  id,
  title,
  date,
  description,
  username,
  thumbnail,
  views = 0,
  likes_count = 0,
}) => {
  // サムネイルのフォールバックコンポーネント
  const ThumbnailFallback = () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-12 w-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    </div>
  );

  return (
    <div className="h-full overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
      <Link href={`/artworks/${id}`} className="group">
        <div className="relative h-48 w-full">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              width={400}
              height={200}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <ThumbnailFallback />
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/artworks/${id}`} className="group">
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{title}</h3>
        </Link>
        <div className="mb-3 flex items-center text-sm text-gray-600">
          <span>{username}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(date)}</span>
        </div>
        {description && <p className="mb-3 line-clamp-2 text-sm text-gray-700">{description}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-sm text-gray-600">
              <EyeIcon className="mr-1 h-4 w-4" />
              {views}
            </span>
            <span className="flex items-center text-sm text-gray-600">
              <HeartIcon className="mr-1 h-4 w-4" />
              {likes_count}
            </span>
          </div>

          {/* 編集リンク */}
          <Link
            href={`/mylist/edit/${id}`}
            className="flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            <PencilIcon className="mr-1 h-4 w-4" />
            編集
          </Link>
        </div>
      </div>
    </div>
  );
};

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
          {works.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MyWorkCard
                id={work.id}
                title={work.title}
                date={work.created_at}
                description={work.description}
                username={work.user?.nickname || 'Unknown'}
                thumbnail={work.thumbnail_url || '/placeholder-image.jpg'}
                views={work.views}
                likes_count={work.likes_count}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <h2 className="mb-2 text-xl font-medium text-gray-900">まだ作品がありません</h2>
          <p className="mb-4 text-gray-600">最初の作品を作成してみましょう。</p>
          <Link
            href="/mylist/submit"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            作品を作成
          </Link>
        </div>
      )}
    </div>
  );
}
