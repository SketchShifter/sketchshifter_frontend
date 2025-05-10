'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';

const TopBar = () => {
  const [humOpen, setHumOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // カスタムフックを使用してユーザー情報と認証状態を取得
  const { user, isAuthenticated } = useCurrentUser();
  // ログアウト処理のフックを取得
  const logout = useLogout();

  // クライアントサイドでのみレンダリングするためのフラグ
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    // TanStack Query と Zustand で管理するログアウト処理を実行
    logout();
    setHumOpen(false);
  };

  const Button = ({
    title,
    props,
    btnprops,
  }: {
    title: string;
    props: React.ComponentProps<typeof Link>;
    btnprops?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  }) => {
    return (
      <button
        className={`group relative w-full rounded-md border-b border-gray-700 px-5 py-3 text-white transition-all duration-300 hover:bg-gray-700 hover:text-gray-300 md:w-auto md:rounded-none md:border-none md:p-0 md:hover:bg-transparent`}
        {...btnprops}
        onClick={() => {
          setHumOpen(false);
        }}
      >
        <Link className="block w-full" {...props}>
          {title}
        </Link>
        <span className="absolute -bottom-1 left-0 hidden h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full md:block"></span>
      </button>
    );
  };

  const Hum = ({ open }: { open: boolean }) => {
    const [cn, setCN] = useState({
      top: 'rotate-none translate-none',
      middle: 'rotate-none',
      bottom: 'rotate-none translate-none',
    });

    useEffect(() => {
      if (open) {
        setCN({
          top: 'rotate-45 translate-y-[0.5rem]',
          middle: 'rotate-y-90',
          bottom: '-rotate-45 translate-y-[-0.5rem]',
        });
      } else {
        setCN({
          top: 'rotate-0 translate-none',
          middle: 'rotate-y-0',
          bottom: '-rotate-0 translate-none',
        });
      }
    }, [open]);

    return (
      <>
        <div
          className="flex w-full flex-col"
          onClick={() => {
            setHumOpen(!humOpen);
          }}
        >
          <div
            className={`my-1 h-1 w-8 rounded-lg bg-white transition-all duration-500 ease-in-out ${cn.top}`}
          ></div>
          <div
            className={`mb-1 h-1 w-8 rounded-lg bg-white transition-all duration-500 ease-in-out ${cn.middle}`}
          ></div>
          <div
            className={`mb-1 h-1 w-8 rounded-lg bg-white transition-all duration-500 ease-in-out ${cn.bottom}`}
          ></div>
        </div>
      </>
    );
  };

  // 基本的なスタイル（サーバーサイドとクライアントサイドで共通）
  const baseContainerClass = 'flex h-18 w-full items-center justify-between bg-gray-800 px-8 py-4';
  // クライアントサイドでのみ適用する拡張スタイル
  const enhancedContainerClass = mounted ? 'shadow-lg' : '';

  return (
    <div className={`${baseContainerClass} ${enhancedContainerClass}`}>
      <h1
        className={`z-999 text-xl text-white ${mounted ? 'transition-transform duration-300 hover:scale-105' : ''}`}
      >
        <Link
          href={'/'}
          onClick={() => {
            setHumOpen(false);
          }}
        >
          <Image
            src="/psb_small.svg"
            alt="SketchShifter Logo"
            className={`h-14 w-auto ${mounted ? 'drop-shadow-md' : ''}`}
            width={56}
            height={56}
          />
        </Link>
      </h1>
      <div
        className={`absolute top-5 right-10 z-999 cursor-pointer md:hidden ${mounted ? 'transition-transform duration-300 hover:scale-110' : ''}`}
      >
        <Hum open={humOpen} />
      </div>
      <div
        className={`fixed left-0 z-998 h-screen w-screen overflow-hidden bg-gray-800 px-10 py-20 transition-all duration-500 ease-in-out md:contents ${humOpen ? 'top-0' : 'top-[-100vh]'} ${mounted ? 'bg-opacity-95 backdrop-blur-sm' : ''}`}
      >
        <div className="flex flex-col space-x-4 md:flex-row md:flex-nowrap md:space-x-6">
          {isAuthenticated && user ? (
            <>
              <div className="flex flex-col items-center space-y-6 md:flex-row md:space-y-0 md:space-x-6">
                <Button title="投稿" props={{ href: '/mylist/submit' }} />
                <Button title="プレビュー" props={{ href: '/preview' }} />
                <Button title="作品一覧" props={{ href: '/artworks' }} />
                <Button title="マイリスト" props={{ href: '/mylist' }} />
                <button
                  className={`group relative w-full rounded-md border-b border-gray-700 px-5 py-3 text-white transition-all duration-300 hover:bg-gray-700 hover:text-gray-300 md:w-auto md:rounded-none md:border-none md:p-0 md:hover:bg-transparent`}
                  onClick={() => {
                    handleLogout();
                    setHumOpen(false);
                  }}
                >
                  <span className="block w-full">ログアウト</span>
                  <span className="absolute -bottom-1 left-0 hidden h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full md:block"></span>
                </button>
                <Button title={`${user.nickname} さん`} props={{ href: '/mylist' }} />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-6 md:flex-row md:space-y-0 md:space-x-6">
                <Button title="プレビュー" props={{ href: '/preview' }} />
                <Button title="作品一覧" props={{ href: '/artworks' }} />
                <Button title="ログイン" props={{ href: '/login' }} />
                <Button title="アカウント登録" props={{ href: '/register' }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
