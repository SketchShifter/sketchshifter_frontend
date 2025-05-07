'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

interface CardProps {
  id: string;
  title: string;
  date: string;
  description: string;
  username: string;
  thumbnail: string;
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
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes_count);

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

    try {
      const token = localStorage.getItem('token'); // トークンを取得
      if (!token) {
        toast.error('ログインが必要です。');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works/${id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsLiked(true);
        setLocalLikes((prev) => prev + 1);
        toast.success('いいねを押しました！');
      } else {
        const errorData = await response.json();
        toast.error(`エラー: ${errorData.message || 'いいねに失敗しました。'}`);
      }
    } catch (error) {
      console.error('エラーが発生しました:', error);
      toast.error('サーバーに接続できませんでした。');
    }
  };

  return (
    <Link href={`/artworks/${id}`}>
      <div className="overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg">
        {/* サムネイル */}
        <div className="relative h-48 w-full">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={(e) => {
                // エラー時は画像要素を非表示にしてフォールバックを表示
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <ThumbnailFallback />
          )}

          {/* いいねボタン - 重ねて表示 */}
          <button
            className={`absolute right-2 bottom-2 rounded-full p-2 shadow-md transition ${
              isLiked ? 'bg-red-100 text-red-500' : 'bg-white text-red-500 hover:bg-red-100'
            }`}
            title="いいね"
            onClick={handleLike}
          >
            <HeartIcon className="h-6 w-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4">
          <h3 className="mb-1 truncate text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mb-3 text-sm text-gray-500">{username}</p>

          {/* 説明文 - 2行で切り捨て */}
          <p className="mb-3 line-clamp-2 text-sm text-gray-700">{description}</p>

          {/* スタッツ情報 */}
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex space-x-3">
              <span>👁️ {views}</span>
              <span>❤️ {localLikes}</span>
            </div>
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorksCard;
