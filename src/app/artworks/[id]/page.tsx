import Link from "next/link";

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1>作品詳細ページ: {id}</h1>
      <p>この作品の詳細情報が表示されます</p>
      <div>
        <Link href={`/mylist/edit/${id}`}>この作品を編集する</Link>
      </div>
      <div>
        <Link href="/artworks">作品一覧に戻る</Link>
      </div>
    </div>
  );
}
