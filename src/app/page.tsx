'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import Card from '../components/Card';


export default function HomePage() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([] as any);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8080/api/works');
      const data = await response.json();
      setData(data);
    }
    fetchData();
  }, []);

  console.log(data);
  console.log(data.works);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.works && data.works.map((work) => (
          <Card key={work.id} id={work.id} title={work.title} created_at={work.created_at} description={work.description} />
        ))}
      </div>
    </div>
  );
}
