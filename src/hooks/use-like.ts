import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.serendicode-sub.click';

// 単一作品のいいねを処理するフック
export function useLikeWork() {
  const { token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (workId: string | number) => {
      if (!isAuthenticated || !token) {
        throw new Error('ログインが必要です');
      }

      const response = await fetch(`${API_BASE_URL}/works/${String(workId)}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'いいね処理に失敗しました');
      }

      return await response.json();
    },
    onSuccess: (data, workId) => {
      // 関連するデータのキャッシュを更新
      queryClient.invalidateQueries({ queryKey: ['work', String(workId)] });
      queryClient.invalidateQueries({ queryKey: ['works'] });
      toast.success('いいねしました！');
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === 'ログインが必要です') {
          toast.error('ログインが必要です。');
          router.push('/login');
        } else {
          toast.error(`エラー: ${error.message}`);
        }
      } else {
        toast.error('エラーが発生しました。');
      }
    },
  });
}
