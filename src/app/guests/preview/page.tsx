import Link from "next/link";

export default function PreviewPage() {
  return (
    <div>
      <h1>プレビューページ</h1>
      <p>Processingコードをデータベースに保存せずにプレビューできます</p>
      <div>
        <Link href="/guests/submit">ゲストとして投稿する</Link>
      </div>
      <div>
        <Link href="/">ホームに戻る</Link>
      </div>
    </div>
  );
}
