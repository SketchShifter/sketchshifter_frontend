import Link from 'next/link';
import WorksCard from '../components/workscard';

interface Work {
  id: string;
  title: string;
  created_at: string;
  description: string;
  user: {
    nickname: string;
  };
  thumbnail_url: string;
  views?: number;
  likes_count?: number;
}

interface HomeGalleryProps {
  data: {
    works: Work[];
  };
}

export default function HomeGallery({ data }: HomeGalleryProps) {
  // データが存在するか確認
  if (!data.works || data.works.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">表示できる作品がありません</p>
      </div>
    );
  }

  // 人気作品（とりあえず最初の3つを表示）
  // 実際には likes_count や views などでソートするとよい
  const popularWorks = [...data.works]
    .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    .slice(0, 3);

  // 最新作品（作成日順に並べ替え）
  const recentWorks = [...data.works]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4">
      {/* 人気作品セクション */}
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">人気の作品</h2>
          <Link
            href="/artworks?sort=popular"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            すべて見る
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {popularWorks.map((work) => (
            <WorksCard
              key={work.id}
              id={work.id}
              title={work.title}
              date={work.created_at}
              description={work.description}
              username={work.user.nickname}
              thumbnail={work.thumbnail_url}
            />
          ))}
        </div>
      </section>

      {/* 最近の作品セクション */}
      <section className="-mx-4 mt-8 bg-gray-50 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">最近の作品</h2>
          <Link
            href="/artworks?sort=newest"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            すべて見る
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {recentWorks.map((work) => (
            <WorksCard
              key={work.id}
              id={work.id}
              title={work.title}
              date={work.created_at}
              description={work.description}
              username={work.user.nickname}
              thumbnail={work.thumbnail_url}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
