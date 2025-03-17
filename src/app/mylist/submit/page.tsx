import Link from "next/link";

export default function SubmitArtworkPage() {
  return (
    <div>
      <h1>作品投稿ページ</h1>
      <p>新しい作品をアップロードする画面です</p>
      <div>
        <Link href="/mylist">マイリストに戻る</Link>
      </div>
    </div>
  );
}
