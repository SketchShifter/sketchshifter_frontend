'use client';

import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { toast } from 'react-toastify';
interface InputType {
  email: string;
  password: string;
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const loginFailed = (error: Response) => {
    if (error.status === 401) {
      setMessage('パスワードが違うか、アカウントが存在しません。');
      setLoading(false);
    } else {
      throw new Error(`unexpect error occuerd: ${error}`);
    }
    return '';
  };

  const loginSuccess = async () => {
    console.log('ログイン成功');
    await router.push('/');
    await window.location.reload();
    router.refresh();
  };

  const loginReq = async (data: InputType) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        loginFailed(res);
        console.error('res;', res);
        throw new Error(`some error occured: ${res}`);
      }
      const response = await res.json();
      const token = response.token;
      await localStorage.setItem('token', token);
      console.log('token;', token);
      loginSuccess();
    } catch (error) {
      throw new Error(`fetch error occured:${error}`);
    }
  };

  const isValid = (data: InputType) => {
    setLoading(true);
    loginReq(data);
  };

  const isInValid = (error: FieldErrors<InputType>) => {
    console.error('Validation error:', error);
  };

  return (
    <div className="bg-gray-100 py-10">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">ログイン</h1>
        <div>{message}</div>
        <form onSubmit={handleSubmit(isValid, isInValid)} className="space-y-4">
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
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-md px-4 py-2 font-medium text-white ${
                loading ? 'bg-gray-400' : 'bg-blue-500 hover:cursor-pointer hover:bg-blue-600'
              } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none`}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <a href="login/reset" className="text-sm text-blue-500 hover:underline">
            パスワードをリセット
          </a>
        </div>
      </div>
    </div>
  );
};

export { Login };
