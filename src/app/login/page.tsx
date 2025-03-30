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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
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
    <Login />
  );
}