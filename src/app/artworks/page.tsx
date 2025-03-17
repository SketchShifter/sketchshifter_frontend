import Link from "next/link";

export default function ArtworksPage() {
  return (
    <div>
      <h1>作品一覧ページ</h1>
      <p>ここではすべての作品が一覧表示されます</p>
      <ul>
        <li><Link href="/artworks/1">作品1の詳細</Link></li>
        <li><Link href="/artworks/2">作品2の詳細</Link></li>
      </ul>
    </div>
  );
}
