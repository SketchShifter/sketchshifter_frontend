'use client';

import HomeGallery from "@/components/home-gallery";
import { useEffect, useState } from 'react';
import { ApiResponse } from '@/types/dataType';

export default function MyListPage() {
  const [data, setData] = useState<ApiResponse>({ works: [] });

  // 作品を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // ローカルストレージからトークンを取得

        if (!token) {
          console.error("トークンが見つかりません。ログインしてください。");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/my-works`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // トークンをAuthorizationヘッダーに追加
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("データの取得に失敗しました。");
          return;
        }

        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("エラーが発生しました:", error);
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
