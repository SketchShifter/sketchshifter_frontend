'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import Card from '../components/workscard';

export default function HomePage() {
  const [data, setData] = useState([] as any);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8080/api/works');
      const data = await response.json();
      setData(data);
    }
    fetchData();
  }, []);

  console.log(data);
  console.log(data.works);

  return (
    <div>
      <p className="mb-4">ここには人気作品や最新作品のギャラリーが表示されます</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.works && data.works.map((work) => (
          <Card key={work.id} id={work.id} title={work.title} date={work.created_at} description={work.description} />
        ))}
      </div>
    </div>
  );
}