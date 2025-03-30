'use client'

import { getAuthSession, type ReturnDataProps } from '@/lib/auth';
import { set } from 'date-fns';
import Link from 'next/link';
import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';

const TopBar = () => {
  const [session, setSession] = useState<ReturnDataProps>(null)
  useEffect(() => {
    const fetchSession = async () => {
      const getSession = await getAuthSession();
      setSession(getSession);
    }
    // getSession = {
    //   id: string
    //   name: string
    //   email: string
    //   role?: string // 追加機能に使うかも？
    // }
    fetchSession()
  }, [])

  const handleLogout = async () => {
    setSession(null);
    localStorage.removeItem('token'); // トークンをローカルストレージから削除
  }

  return (
    <div className="bg-gray-800 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl">
        <Link href={"/"}>
          <img src="/ssjs.svg" alt="SketchShifter Logo" className="h-10 w-auto" />
        </Link>
      </h1>
      <div className="ml-auto flex space-x-4">
        {session ? (
          <>
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
            <button className="text-white" onClick={handleLogout}>
              ログアウト
            </button>
            <p className="text-white">{`${session.nickname} さん`}</p>
          </>
        ) : (
          <>
            <button className="text-white">
              <Link href={"/post"}>投稿</Link>
            </button>
            <button className="text-white">
              <Link href={"/artworks"}>作品一覧</Link>
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
            <p className="text-white">ゲスト さん</p>
          </>
        )}
      </div >
    </div >
  );
};

export default TopBar;

