import { Register } from "@/components/auth/Register";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div>
      <h1>アカウント登録ページ</h1>
      <p>新しいアカウントを作成します</p>
      <div>
        <a href="/login">すでにアカウントをお持ちの方はこちら</a>
      </div>
      <div>
        <Link href="/">ホームに戻る</Link>
      </div>
      <Register />
    </div>
  );
}
