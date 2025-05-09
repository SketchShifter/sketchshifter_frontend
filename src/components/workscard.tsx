'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatDate } from '@/lib/formatDate';
import { useLikeWork } from '@/hooks/use-like';
import { useCurrentUser } from '@/hooks/use-auth';

// Workから必要なプロパティを取り出して表示用に最適化したインターフェース
export interface CardProps {
  id: string | number;
  title: string;
  date: string; // created_atの別名
  description: string;
  username: string; // user.nicknameの別名
  thumbnail: string; // thumbnail_urlの別名
  views?: number;
  likes_count?: number;
}

const WorksCard: React.FC<CardProps> = ({
  id,
  title,
  date,
  description,
  username,
  thumbnail,
  views = 0,
  likes_count = 0,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes_count);

  // TanStack Queryのミューテーションを使用
  const likeMutation = useLikeWork();
  // 認証状態を確認
  const { isAuthenticated } = useCurrentUser();

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

  // いいねボタンのハンドラー
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // 親のリンク遷移を防ぐ

    if (!isAuthenticated) {
      // useCurrentUserから取得した認証状態を利用
      return;
    }

    try {
      // TanStack Queryのミューテーションを実行
      await likeMutation.mutateAsync(id);

      // UI状態を更新
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    } catch (error) {
      // エラー処理はミューテーションのonErrorで行われる
      console.error('いいね処理中にエラー:', error);
    }
  };

  return (
    <Link href={`/artworks/${id}`} className="group">
      <div className="h-full overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
        <div className="relative h-48 w-full">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              layout="fill"
              objectFit="cover"
              className="transition-transform group-hover:scale-105"
            />
          ) : (
            <ThumbnailFallback />
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{title}</h3>
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
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`flex items-center text-sm ${liked ? 'text-pink-600' : 'text-gray-600'}`}
              >
                {liked ? (
                  <HeartIconSolid className="mr-1 h-4 w-4" />
                ) : (
                  <HeartIcon className="mr-1 h-4 w-4" />
                )}
                {likesCount}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorksCard;
