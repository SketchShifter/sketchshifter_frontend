import Link from "next/link";

export default function GuestSubmitPage() {
  return (
    <div>
      <h1>ゲスト投稿ページ</h1>
      <p>ログインせずに作品を投稿できます</p>
      <div>
        <Link href="/guests/preview">プレビューする</Link>
      </div>
      <div>
        <Link href="/">ホームに戻る</Link>
      </div>
    </div>
  );
}
