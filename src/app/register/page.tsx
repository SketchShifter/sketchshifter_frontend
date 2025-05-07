"use client";

import { Register } from "@/components/auth/Register";

export default function RegisterPage() {
  // const [formData, setFormData] = useState({
  //   email: "",
  //   password: "",
  //   name: "",
  //   nickname: "",
  // });

  // const [message, setMessage] = useState("");

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (response.ok) {
  //       setMessage("アカウント登録が成功しました！");
  //     } else {
  //       const errorData = await response.json();
  //       setMessage(`エラー: ${errorData.error || "登録に失敗しました"}`);
  //     }
  //   } catch (error) {
  //     setMessage("サーバーに接続できませんでした。");
  //   }
  // };

  return (
    <Register />
  );
}