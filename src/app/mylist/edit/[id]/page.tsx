import Link from 'next/link';

export default async function EditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1>作品編集ページ: {id}</h1>
      <p>作品の情報を編集する画面です</p>
      <div>
        <Link href="/mylist">マイリストに戻る</Link>
      </div>
      <div>
        <Link href={`/artworks/${id}`}>作品詳細に戻る</Link>
      </div>
    </div>
  );
}
