'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const TopBar = () => {
  const [user, setUser] = useState(null as any);

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
    <div className="bg-gray-800 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl">
        <Link href={"/"}>SketchShifter</Link>
      </h1>
      <div className="ml-auto flex space-x-4"> {/* ボタンを右端に配置 */}
        <button className="text-white">
          <Link href={"post"}>投稿</Link>
        </button>
        <button className="text-white">
          <Link href={"artworks"}>作品一覧</Link>
        </button>
        <button className="text-white">
          <Link href={"mylist"}>マイリスト</Link>
        </button>
        <button className="text-white">
          <Link href={"preview"}>ゲストプレビュー</Link>
        </button>
        <button className="text-white">
          <Link href={"/login"}>ログイン</Link>
        </button>
        {user && user.nickname === undefined && (
          <button className="text-white">
            <Link href={"register"}>アカウント登録</Link>
          </button>
        )}
        <p className="text-white">{user ? `${user.nickname} さん` : "ゲスト さん"}</p>
      </div>
    </div>
  );
};

export default TopBar;

