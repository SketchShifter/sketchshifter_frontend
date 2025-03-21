'use client';

import { useEffect, useState } from 'react';
import WorksCard from '../components/workscard';
import TopBar from '@/components/topbar';

export default function HomePage() {
  const [data, setData] = useState([] as any);
  const [user, setUser] = useState(null as any);

  //作品を取得
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8080/api/v1/works');
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); // トークンをローカルストレージから取得
        if (!token) {
          setUser(null);
          return;
        }

        const response = await fetch('http://localhost:8080/api/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`, // トークンをAuthorizationヘッダーに追加
          },
        });

        if (!response.ok) {
          console.log('ユーザー情報の取得に失敗しました。');
          return;
        }

        const user = await response.json();
        setUser(user); // ユーザー情報をステートに保存
      } catch (error) {
        console.error('エラーが発生しました:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4">
      {/* コンテンツ全体を中央揃え */}
      <p className="mb-4">ここには人気作品や最新作品のギャラリーが表示されます</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.works && data.works.map((work) => (
          <WorksCard
            key={work.id}
            id={work.id}
            title={work.title}
            date={work.created_at}
            description={work.description}
            username={work.user.nickname}
            thumbnail={work.thumbnail_url}
          />
        ))}
      </div>
    </div>
  );
}