'use client';

import { useEffect, useState } from 'react';
import HomeGallery from '@/components/home-gallery';
import type { ApiResponse } from '@/types/dataType';
import Top from '@/components/top/Top';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [data, setData] = useState<ApiResponse>({ works: [] });
  const [isLoading, setIsLoading] = useState(true);

  // 作品を取得
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Top />
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <HomeGallery data={data} />
        )}
      </div>
    </motion.div>
  );
}
