'use client';

import { useEffect, useState } from 'react';
import WorksCard from '../components/workscard';

export default function HomePage() {
  const [data, setData] = useState([] as any);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8080/api/works');
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4">
      {/* コンテンツ全体を中央揃え */}
      <p className="mb-4">ここには人気作品や最新作品のギャラリーが表示されます</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.works && data.works.map((work) => (
          <WorksCard
            key={work.id}
            id={work.id}
            title={work.title}
            date={work.created_at}
            description={work.description}
            username={work.user.nickname}
          />
        ))}
      </div>
    </div>
  );
}