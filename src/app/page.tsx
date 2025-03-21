'use client';

import { useEffect, useState } from 'react';
import WorksCard from '../components/workscard';
import TopBar from '@/components/topbar';
import HomeGallery from '@/components/home-gallery';

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
    <div>
      <HomeGallery data={data} />
    </div>
  );
}