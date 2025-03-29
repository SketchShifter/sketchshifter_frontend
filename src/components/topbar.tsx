'use client'

import { getAuthSession, type ReturnDataProps } from '@/lib/auth';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const TopBar = () => {
  const [session, setSession] = useState<ReturnDataProps>(null)
  console.log(session); // セッション情報をログに出力
  useEffect(() => {
    console.log(session); // セッション情報をログに出力
    const fetchSession = async () => {
      try {
        const session = await getAuthSession(); // セッション情報を取得
        console.log(session); // セッション情報をログに出力
        setSession(session); // セッション情報をステートに保存
      } catch (error) {
        console.error('Failed to fetch session:', error); // エラーが発生した場合のログ
      }
    };

    fetchSession(); // 非同期関数を即時実行
  }, []);
  if (session) {
    // ログイン済みの場合(nullじゃないとき)
    console.log("ログインしている");
  } else {
    // ログインしていない場合(null)
    console.log("ログインしていない");
  }

  return (
    <div className="bg-gray-800 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl">
        <Link href={"/"}>
          <img src="/ssjs.svg" alt="SketchShifter Logo" className="h-20 w-auto object-contain" />
        </Link>
      </h1>
      <div className="ml-auto flex space-x-4"> {/* ボタンを右端に配置 */}
        <button className="text-white">
          <Link href={"/post"}>投稿</Link>
        </button>
        <button className="text-white">
          <Link href={"/artworks"}>作品一覧</Link>
        </button>
        <button className="text-white">
          <Link href={"/mylist"}>マイリスト</Link>
        </button>
        <button className="text-white">
          <Link href={"/preview"}>ゲストプレビュー</Link>
        </button>
        <button className="text-white">
          <Link href={"/login"}>ログイン</Link>
        </button>
        <button className="text-white">
          <Link href={"/register"}>アカウント登録</Link>
        </button>
        {/* <p className="text-white">{user ? `${user.nickname} さん` : "ゲスト さん"}</p> */}
      </div>
    </div>
  );
};

export default TopBar;

