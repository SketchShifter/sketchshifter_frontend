'use client';

import { useEffect, useState } from 'react';
import HomeGallery from '@/components/home-gallery';

export default function HomePage() {
  const [data, setData] = useState([] as any);

  //作品を取得
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`);
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <HomeGallery data={data} />
    </div>
  );
}