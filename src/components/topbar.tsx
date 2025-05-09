'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';

const TopBar = () => {
  const [humOpen, setHumOpen] = useState(false);

  // カスタムフックを使用してユーザー情報と認証状態を取得
  const { user, isAuthenticated } = useCurrentUser();
  // ログアウト処理のフックを取得
  const logout = useLogout();

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
        className="border-b border-solid p-2 text-white md:border-none md:p-0"
        {...btnprops}
        onClick={() => {
          setHumOpen(false);
        }}
      >
        <Link {...props}>{title}</Link>
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

  return (
    <div className="flex h-18 w-full items-center justify-between bg-gray-800 px-8 py-4">
      <h1 className="z-999 text-xl text-white">
        <Link
          href={'/'}
          onClick={() => {
            setHumOpen(false);
          }}
        >
          <Image
            src="/psb_small.svg"
            alt="SketchShifter Logo"
            className="h-14 w-auto"
            width={56}
            height={56}
          />
        </Link>
      </h1>
      <div className={`absolute top-5 right-10 z-999 md:hidden`}>
        <Hum open={humOpen} />
      </div>
      <div
        className={`fixed left-0 z-998 h-screen w-screen overflow-hidden bg-gray-800 px-10 py-20 transition-all duration-500 ease-in-out md:contents ${humOpen ? 'top-0' : 'top-[-100vh]'}`}
      >
        <div className="flex flex-col space-x-4 md:flex-row md:flex-nowrap">
          {isAuthenticated && user ? (
            <>
              <Button title="投稿" props={{ href: '/mylist/submit' }} />
              <Button title="プレビュー" props={{ href: '/preview' }} />
              <Button title="作品一覧" props={{ href: '/artworks' }} />
              <Button title="マイリスト" props={{ href: '/mylist' }} />
              <button
                className="border-b border-solid p-2 text-white md:border-none md:p-0"
                onClick={() => {
                  handleLogout();
                  setHumOpen(false);
                }}
              >
                ログアウト
              </button>
              <Button title={`${user.nickname} さん`} props={{ href: '/mylist' }} />
            </>
          ) : (
            <>
              <Button title="プレビュー" props={{ href: '/preview' }} />
              <Button title="作品一覧" props={{ href: '/artworks' }} />
              <Button title="ログイン" props={{ href: '/login' }} />
              <Button title="アカウント登録" props={{ href: '/register' }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
