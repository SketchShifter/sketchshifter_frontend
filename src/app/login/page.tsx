"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Login } from '@/components/auth/Login';
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token); // トークンをローカルストレージに保存
        setMessage("ログインに成功しました！");
        router.push("/"); // ログイン後にホームページにリダイレクト
      } else {
        const errorData = await response.json();
        setMessage(`エラー: ${errorData.error || "ログインに失敗しました。"}`);
      }
    } catch (error) {
      setMessage("サーバーに接続できませんでした。");
    }
  };

  return (
    // <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
    //   <h1 className="text-2xl font-bold mb-4">ログイン</h1>
    //   <form onSubmit={handleSubmit} className="space-y-4">
    //     <div>
    //       <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    //         メールアドレス
    //       </label>
    //       <input
    //         type="email"
    //         id="email"
    //         name="email"
    //         value={formData.email}
    //         onChange={handleChange}
    //         required
    //         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //       />
    //     </div>
    //     <div>
    //       <label htmlFor="password" className="block text-sm font-medium text-gray-700">
    //         パスワード
    //       </label>
    //       <input
    //         type="password"
    //         id="password"
    //         name="password"
    //         value={formData.password}
    //         onChange={handleChange}
    //         required
    //         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //       />
    //     </div>
    //     <button
    //       type="submit"
    //       className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    //     >
    //       ログイン
    //     </button>
    //   </form>
    //   {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
    //   <p className="mt-4 text-center text-sm text-gray-600">
    //     アカウントをお持ちでないですか？{" "}
    //     <Link href="/register" className="text-blue-500 hover:underline">
    //       登録はこちら
    //     </Link>
    //   </p>
    // </div>
    <Login />
  );
}