'use client';

import { useEffect, useState } from 'react';
import HomeGallery from '@/components/home-gallery';
import type { ApiResponse } from '@/types/dataType';
import Top from '@/components/top/Top';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [data, setData] = useState<ApiResponse>({ works: [] });

  //作品を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`);
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Top />
      <motion.div
        className="mt-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <HomeGallery data={data} />
      </motion.div>
    </motion.div>
  );
}
