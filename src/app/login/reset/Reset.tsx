'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface PasswordResetFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Reset() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PasswordResetFormData>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('新しいパスワードが一致しません');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('認証が必要です。ログインしてください');
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: data.currentPassword,
          new_password: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'パスワードの変更に失敗しました');
      }

      toast.success('パスワードが正常に変更されました');
      // 成功したらマイページなどに遷移
      router.push('/mylist');
    } catch (error) {
      console.error('パスワード変更エラー:', error);
      toast.error(error instanceof Error ? error.message : 'パスワードの変更に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">パスワード変更</h1>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                現在のパスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="currentPassword"
                {...register('currentPassword', {
                  required: '現在のパスワードを入力してください',
                  minLength: { value: 6, message: '6文字以上入力してください' },
                })}
                className="block w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">
                新しいパスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                {...register('newPassword', {
                  required: '新しいパスワードを入力してください',
                  minLength: { value: 6, message: '6文字以上入力してください' },
                })}
                className="block w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                新しいパスワードを確認 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: '新しいパスワードを再入力してください',
                  validate: (value) =>
                    value === getValues('newPassword') || 'パスワードが一致しません',
                })}
                className="block w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-md px-4 py-2 text-white ${
                  isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? '処理中...' : 'パスワードを変更する'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-sm">
          <Link href="/mylist" className="text-indigo-600 hover:underline">
            マイページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
