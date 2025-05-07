'use client';

import HomeGallery from "@/components/home-gallery";
import { useEffect, useState } from 'react';
import { ApiResponse } from '@/types/dataType';
export default function ArtworksPage() {
  const [data, setData] = useState<ApiResponse>({ works: [] });

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
