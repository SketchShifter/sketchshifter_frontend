'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';
interface InputType {
  email: string;
  password: string;
  passwordRe: string;
  name: string;
  nickname: string;
}

const Register = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<InputType>({
    mode: 'onBlur',
  });

  useEffect(() => {
    const checkAuthSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        toast.success('ログインしました');
        redirect('/');
      }
    };

    checkAuthSession();
  }, []);

  const registerReq = async (data: InputType) => {
    try {
      if (data.password !== data.passwordRe) {
        alert('パスワードが一致しません');
        return null;
      }
      const setData = {
        email: data.email,
        password: data.password,
        name: data.name,
        nickname: data.nickname,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setData),
      });
      if (!res.ok) {
        if (res.status === 409) {
          alert('既に登録されています。');
          router.push('/login');
        }
        throw new Error(`レスポンスステータス: ${res.status}`);
      }
      const responce = await res.json();
      const token = responce.token;
      localStorage.setItem('token', token);

      await router.push('/');
      await window.location.reload();
      router.refresh();
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const isValid = (data: InputType) => {
    setLoading(true);
    registerReq(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">アカウント登録</h1>
        <form onSubmit={handleSubmit(isValid)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <input
              {...register('name', { required: '名前を入力してください' })}
              className={`mt-1 block w-full border px-3 py-2 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none`}
              type="text"
              name="name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
              ニックネーム
            </label>
            <input
              {...register('nickname', { required: 'ニックネームを入力してください' })}
              className={`mt-1 block w-full border px-3 py-2 ${
                errors.nickname ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none`}
              type="text"
              name="nickname"
            />
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-500">{errors.nickname.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              {...register('email', { required: 'メールアドレスを入力してください' })}
              className={`mt-1 block w-full border px-3 py-2 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none`}
              type="email"
              name="email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              {...register('password', {
                required: 'パスワードを入力してください',
                minLength: { value: 8, message: '8文字以上入力してください' },
              })}
              className={`mt-1 block w-full border px-3 py-2 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none`}
              type="password"
              name="password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="passwordRe" className="block text-sm font-medium text-gray-700">
              パスワード（再入力）
            </label>
            <input
              {...register('passwordRe', {
                required: 'パスワードを再入力してください',
                minLength: { value: 8, message: '8文字以上入力してください' },
                validate: {
                  matchesPreviousPassword: (value) => {
                    const { password } = getValues();
                    return password === value || 'パスワードが一致しません';
                  },
                },
              })}
              className={`mt-1 block w-full border px-3 py-2 ${
                errors.passwordRe ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none`}
              type="password"
              name="passwordRe"
            />
            {errors.passwordRe && (
              <p className="mt-1 text-sm text-red-500">{errors.passwordRe.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-md px-4 py-2 font-medium text-white ${
                loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none`}
            >
              {loading ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { Register };
