'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import { useLogin } from '@/hooks/use-auth';
import type { LoginInput } from '@/types/dataTypes';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();
  const loginMutation = useLogin();

  const onSubmit = async (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* 左側：画像エリア */}
      <div className="relative hidden w-3/5 md:block">
        <Image
          src="/1037680.jpg"
          alt="グローバルネットワーク"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1200px) 60vw, 50vw"
        />
      </div>

      {/* 右側：ログインフォーム */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 md:w-2/5 md:px-12">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">ログイン</h1>
          <p className="mb-8 text-gray-600">アカウントにアクセスして続けましょう</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="mt-1 rounded-md border border-gray-300 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'メールアドレスは必須です',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '有効なメールアドレスを入力してください',
                    },
                  })}
                  className="block w-full rounded-md border-0 px-3 py-3 focus:outline-none sm:text-sm"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="relative mt-1 rounded-md border border-gray-300 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'パスワードは必須です',
                    minLength: {
                      value: 6,
                      message: 'パスワードは6文字以上である必要があります',
                    },
                  })}
                  className="block w-full rounded-md border-0 px-3 py-3 pr-10 focus:outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  ログイン状態を保持
                </label>
              </div>
              <div className="text-sm">
                {/* <Link
                  href="/forgot-password"
                  className="font-medium text-gray-700 hover:text-gray-900"
                >
                  パスワードをお忘れですか？
                </Link> */}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full rounded-md bg-gray-700 px-4 py-3 text-white shadow-sm hover:bg-black focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:opacity-70"
              >
                {loginMutation.isPending ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでないですか？{' '}
              <Link
                href="/register"
                className="font-medium text-gray-800 hover:text-gray-900 hover:underline"
              >
                会員登録
              </Link>
            </p>
          </div>

          {loginMutation.isError && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">ログインに失敗しました</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {loginMutation.error instanceof Error
                        ? loginMutation.error.message
                        : 'エラーが発生しました。もう一度お試しください。'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
