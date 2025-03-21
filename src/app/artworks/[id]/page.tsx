'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ArtworkDetailPage({ params }: { params: { id: string } }) {
  const { id } = params; // paramsを直接使用
  const [data, setData] = useState<any>(null); // 初期値をnullに設定

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/works/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching artwork details:", error);
      }
    };
    fetchData();
  }, [id]); // idが変更されたときに再実行

  if (!data) {
    return <p>Loading...</p>; // データが読み込まれるまでローディング表示
  }

  return (
    <div className="container mx-auto px-4">
      {/* 画像を中央揃え */}
      <div className="flex justify-center items-center mb-4">
        <img
          src="https://jra-van.jp/fun/memorial/img/horses/l_2018105027.jpg"
          alt={data.title}
          className="w-full max-w-md"
        />
      </div>
      <div className="flex justify-end items-center space-x-4 mb-4">
        <p>{`いいね数:${data.likes_count}`}</p>
        <p>{`閲覧数:${data.views}`}</p>
      </div>
      <h1 className="flex justify-start text-2xl font-bold text-center mb-4">{data.title}</h1>
      <p className="m-0 text-md text-gray-500 mb-5">{`by ${data.user.nickname}`}</p>
      <div className="flex space-x-2 mb-2">
        {data.tags && data.tags.map((tag: { id: number; name: string }) => (
          <span
            key={tag.id}
            className="px-3 py-1 bg-gray-200 text-sm text-gray-700 rounded-full"
          >
            {tag.name}
          </span>
        ))}
      </div>
      <p className="mb-5 text-md text-gray-500">{data.updated_at}</p>
      <p className="text-lg font-bold">作品説明</p>
      <p className="mb-5">{data.description}</p>
      <p className="text-lg font-bold mb-2">ソースコード</p>
      <div className="bg-gray-800 text-white p-4 rounded-md">
        <pre className="whitespace-pre-wrap">{data.code_content}</pre>
      </div>
    </div>
  );
}