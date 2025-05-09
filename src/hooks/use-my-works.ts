import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { Work } from '@/types/dataTypes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.serendicode-sub.click';

export function useMyWorks() {
  const { token, isAuthenticated } = useAuthStore();
  const { isAuthReady } = useCurrentUser();
  const router = useRouter();

  // ユーザーがログインしていない場合、ログインページにリダイレクト
  useEffect(() => {
    // 認証チェックが完了した後にのみリダイレクト
    if (isAuthReady && !isAuthenticated && token === null) {
      router.push('/login?redirect=/mylist');
    }
  }, [isAuthenticated, token, router, isAuthReady]);

  return useQuery({
    queryKey: ['my-works'],
    queryFn: async () => {
      if (!token) {
        throw new Error('認証が必要です');
      }

      const response = await fetch(`${API_BASE_URL}/users/my-works`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '作品の取得に失敗しました');
      }

      const data = await response.json();
      return data.works as Work[];
    },
    enabled: !!token && isAuthenticated,
    staleTime: 30 * 60 * 1000, // 30分間キャッシュ
  });
}
