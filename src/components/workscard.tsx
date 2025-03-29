'use client';

import Link from 'next/link';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { HeartIcon } from "@heroicons/react/24/solid";
import { toast } from 'react-toastify';
import { formatDate } from '../lib/formatDate';

interface CardProps {
  id: string;
  title: string;
  date: string;
  description: string;
  username: string;
  thumbnail: string;
}

const WorksCard: React.FC<CardProps> = ({ id, title, date, description, username, thumbnail }) => {
  console.log(thumbnail);
  return (
    <Link href={`/artworks/${id}`} passHref>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden rounded-lg p-0 relative">
        {/* 画像部分 */}
        <div className="w-full aspect-[16/9] overflow-hidden leading-none relative">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover block"
          />
          {/* いいねボタン */}
          <button
            className="absolute bottom-2 right-2 bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-100 transition"
            onClick={async (e) => {
              e.preventDefault(); // 親のリンク遷移を防ぐ

              try {
                const token = localStorage.getItem('token'); // トークンを取得
                if (!token) {
                  toast.error('ログインが必要です。');
                  return;
                }

                const response = await fetch(`https://api.serendicode-sub.click/works/${id}/like`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`, // トークンをAuthorizationヘッダーに追加
                    'Content-Type': 'application/json',
                  },
                });

                if (response.ok) {
                  toast.success('いいねを押しました！');
                } else {
                  const errorData = await response.json();
                  toast.error(`エラー: ${errorData.message || 'いいねに失敗しました。'}`);
                }
              } catch (error) {
                console.error('エラーが発生しました:', error);
                toast.error('サーバーに接続できませんでした。');
              }
            }}
          >
            <HeartIcon className="w-6 h-6" />
          </button>
        </div>
        {/* カード内容 */}
        <CardContent className="p-4">
          <CardTitle className="m-0 text-lg font-bold">{title}</CardTitle>
          <CardDescription className="m-0 text-sm text-gray-500 mb-5">{`by ${username}`}</CardDescription>
          <p className="mb-5">{description}</p> {/* descriptionの下にマージンを追加 */}
          <p className="m-0 text-sm text-gray-500">{formatDate(date)}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default WorksCard;