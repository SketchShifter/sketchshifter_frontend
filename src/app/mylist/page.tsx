import Link from "next/link";

export default function MyListPage() {
  return (
    <div>
      <h1>マイリスト - 自分の作品一覧</h1>
      <p>あなたがアップロードした作品が表示されます</p>
      <ul>
        <li><Link href="/mylist/submit">新しい作品を投稿する</Link></li>
        <li><Link href="/mylist/edit/1">作品1を編集する</Link></li>
      </ul>
    </div>
  );
}
