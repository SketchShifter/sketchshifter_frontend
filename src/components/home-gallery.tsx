import Link from 'next/link';
import WorksCard from '../components/workscard';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Work, workToCardProps } from '../types/dataTypes';

interface HomeGalleryProps {
  data: {
    works: Work[];
  };
}

export default function HomeGallery({ data }: HomeGalleryProps) {
  const popularRef = useRef(null);
  const recentRef = useRef(null);
  const isPopularInView = useInView(popularRef, { once: true, margin: '-100px' });
  const isRecentInView = useInView(recentRef, { once: true, margin: '-100px' });

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
    .slice(0, 8);

  // 最新作品（作成日順に並べ替え）
  const recentWorks = [...data.works]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <div className="mx-auto px-4">
      {/* 人気作品セクション */}
      <motion.section
        ref={popularRef}
        className="py-8"
        initial={{ opacity: 0 }}
        animate={isPopularInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">人気の作品</h2>
          <Link
            href="/artworks?sort=popular"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            すべて見る
          </Link>
        </div>

        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible">
          {popularWorks.map((work, index) => (
            <motion.div
              key={work.id}
              className="w-[280px] flex-shrink-0 px-2 lg:w-full lg:px-0"
              initial={{ opacity: 0, x: -50 }}
              animate={isPopularInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2 + index * 0.1,
              }}
            >
              <WorksCard {...workToCardProps(work)} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 最近の作品セクション */}
      <motion.section
        ref={recentRef}
        className="-mx-4 bg-gray-50 px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={isRecentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">最近の作品</h2>
          <Link
            href="/artworks?sort=newest"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            すべて見る
          </Link>
        </div>

        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible">
          {recentWorks.map((work, index) => (
            <motion.div
              key={work.id}
              className="w-[280px] flex-shrink-0 px-2 lg:w-full lg:px-0"
              initial={{ opacity: 0, x: -50 }}
              animate={isRecentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2 + index * 0.1,
              }}
            >
              <WorksCard {...workToCardProps(work)} />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
