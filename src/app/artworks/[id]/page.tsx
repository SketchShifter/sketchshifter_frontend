'use client';

import { use } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeartIcon, EyeIcon } from "@heroicons/react/24/solid";
import { formatDate } from '@/lib/formatDate';

export default function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // use() を使って params を展開
  const [data, setData] = useState<any>(null);
  const [isCodeVisible, setIsCodeVisible] = useState(false); // 開閉状態を管理
  const [showScrollToTop, setShowScrollToTop] = useState(false); // スクロールボタンの表示状態を管理

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/works/${id}`);
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
  }, [id]);

  // スクロールイベントを監視してボタンの表示を切り替える
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true); // スクロール位置が300pxを超えたらボタンを表示
      } else {
        setShowScrollToTop(false); // それ以外の場合は非表示
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // クリーンアップ
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // ページの一番上にスムーズにスクロール
  };

  if (!data) {
    return <p>Loading...</p>;
  }

  console.log(data.work.title);

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center items-center mb-4">
        <img
          src={data.work.thumbnail_url}
          alt={data.work.title}
          className="w-full max-w-md"
        />
      </div>
      <div className="flex justify-end items-center space-x-4 mb-4">
        {/* いいね数 */}
        <p className="flex items-center space-x-1">
          <HeartIcon className="w-5 h-5 text-red-500" />
          <span>{data.work.likes_count}</span>
        </p>
        {/* 閲覧数 */}
        <p className="flex items-center space-x-1">
          <EyeIcon className="w-5 h-5 text-gray-500" />
          <span>{data.work.views}</span>
        </p>
      </div>
      <h1 className="flex justify-start text-2xl font-bold text-center mb-4">{data.work.title}</h1>
      <div className="flex space-x-2 mb-2">
        {data.work.tags && data.work.tags.map((tag: { id: number; name: string }) => (
          <span
            key={tag.id}
            className="px-3 py-1 bg-gray-200 text-sm text-gray-700 rounded-full"
          >
            {tag.name}
          </span>
        ))}
      </div>
      <p className="mb-5 text-md text-gray-500">{formatDate(data.work.user.updated_at)}</p>
      <p className="text-lg font-bold">作品説明</p>
      <p className="mb-5">{data.work.description}</p>
      <p className="text-lg font-bold mb-2">ソースコード</p>
      <button
        onClick={() => setIsCodeVisible(!isCodeVisible)} // 開閉状態を切り替え
        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        {isCodeVisible ? "非表示" : "表示"}
      </button>
      {isCodeVisible && ( // 開閉状態に応じて表示を切り替え
        <div className="bg-gray-800 text-white p-4 rounded-md">
          <pre className="whitespace-pre-wrap">{data.work.code_content}</pre>
        </div>
      )}

      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition"
        >
          ↑ 一番上に戻る
        </button>
      )}
    </div>
  );
}
