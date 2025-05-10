'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRegister } from '@/hooks/use-auth';
import type { RegisterInput } from '@/types/dataTypes';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>();
  const registerMutation = useRegister();

  const password = watch('password');

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerMutation.mutateAsync(data);
      // toast.success('アカウントが作成されました！');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`登録失敗: ${error.message}`);
      } else {
        toast.error('アカウント作成に失敗しました。');
      }
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* 左側：画像エリア */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative hidden w-3/5 md:block"
      >
        <Image
          src="/1037680.jpg"
          alt="グローバルネットワーク"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1200px) 60vw, 50vw"
        />
      </motion.div>

      {/* 右側：登録フォーム */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex w-full flex-col justify-center bg-white px-6 py-12 md:w-2/5 md:px-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto w-full max-w-md"
        >
          <h1 className="mb-2 text-3xl font-bold text-gray-900">アカウント作成</h1>
          <p className="mb-8 text-gray-600">新規アカウントを作成して始めましょう</p>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                氏名
              </label>
              <div className="mt-1 rounded-md border border-gray-300 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name', {
                    required: '氏名は必須です',
                  })}
                  className="block w-full rounded-md border-0 px-3 py-3 focus:outline-none sm:text-sm"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                ニックネーム
              </label>
              <div className="mt-1 rounded-md border border-gray-300 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
                <input
                  id="nickname"
                  type="text"
                  {...register('nickname', {
                    required: 'ニックネームは必須です',
                  })}
                  className="block w-full rounded-md border-0 px-3 py-3 focus:outline-none sm:text-sm"
                />
              </div>
              {errors.nickname && (
                <p className="mt-1 text-sm text-red-600">{errors.nickname.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="relative mt-1 rounded-md border border-gray-300 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-gray-500"
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

            <div>
              <label htmlFor="passwordRe" className="block text-sm font-medium text-gray-700">
                パスワード（確認）
              </label>
              <div className="relative mt-1 rounded-md border border-gray-300 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500">
                <input
                  id="passwordRe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('passwordRe', {
                    required: '確認用パスワードは必須です',
                    validate: (value) => value === password || 'パスワードが一致しません',
                  })}
                  className="block w-full rounded-md border-0 px-3 py-3 pr-10 focus:outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.passwordRe && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordRe.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full rounded-md bg-gray-700 px-4 py-3 text-white shadow-sm hover:bg-black focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:opacity-70"
              >
                {registerMutation.isPending ? '登録中...' : 'アカウント作成'}
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link
                href="/login"
                className="font-medium text-gray-800 hover:text-gray-900 hover:underline"
              >
                ログイン
              </Link>
            </p>
          </motion.div>

          {registerMutation.isError && (
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
                  <h3 className="text-sm font-medium text-red-800">登録に失敗しました</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {registerMutation.error instanceof Error
                        ? registerMutation.error.message
                        : 'エラーが発生しました。もう一度お試しください。'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
