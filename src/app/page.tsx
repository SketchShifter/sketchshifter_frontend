"use client";

import Link from "next/link";
import { useState } from "react";


export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Processing作品共有プラットフォーム - ホームページ</h1>
      <p>ここには人気作品や最新作品のギャラリーが表示されます</p>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>カウントを増やす</button>
      <ul>
        <li><Link href="/artworks">作品一覧を見る</Link></li>
        <li><Link href="/mylist">マイリスト</Link></li>
        <li><Link href="/login">ログイン</Link></li>
        <li><Link href="/register">アカウント登録</Link></li>
        <li><Link href="/guests/preview">ゲストプレビュー</Link></li>
      </ul>
    </div>
  );
}
