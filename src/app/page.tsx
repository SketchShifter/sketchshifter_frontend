'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Processing作品共有プラットフォーム - ホームページ</h1>
      <p className="mb-4">ここには人気作品や最新作品のギャラリーが表示されます</p>
      <p>カウント: {count}</p>
      <Button onClick={() => alert('Your face is so beautiful!')}>クリックしてね！</Button>
      <br />
      <button className="rounded bg-blue-500 p-2 text-white" onClick={() => setCount(count + 1)}>
        カウントを増やす
      </button>
      <ul>
        <li>
          <Link href="/artworks">作品一覧を見る</Link>
        </li>
        <li>
          <Link href="/mylist">マイリスト</Link>
        </li>
        <li>
          <Link
            className="mb-4 flex-1/2 justify-center rounded-2xl bg-blue-500 px-4 py-2 text-white"
            href="/login"
          >
            ログイン
          </Link>
        </li>
        <li>
          <Link href="/register">アカウント登録</Link>
        </li>
        <li>
          <Link href="/guests/preview">ゲストプレビュー</Link>
        </li>
      </ul>
    </div>
  );
}
