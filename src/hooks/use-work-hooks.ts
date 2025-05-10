import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { WorksApi } from '@/lib/api';
import { CommentInput, SearchParams, Work } from '@/types/dataTypes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-auth';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.serendicode-sub.click';

// クエリキーを一箇所で定義
export const workQueryKeys = {
  works: ['works'] as const,
  work: (id: string) => ['work', id] as const,
  userWorks: (userId: string, page: number, limit: number) =>
    ['user-works', userId, page, limit] as const,
  myWorks: ['my-works'] as const,
  comments: (workId: string) => ['comments', workId] as const,
  likes: (workId: string) => ['like-status', workId] as const,
};

/**
 * 作品一覧を取得するためのカスタムフック
 * @param params 検索パラメータ
 */
export function useWorks(params?: SearchParams) {
  return useQuery({
    queryKey: workQueryKeys.works,
    queryFn: async () => {
      return await WorksApi.getWorks(params);
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

/**
 * 作品データを取得するフック
 * @param id 作品ID
 */
export function useWork(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: workQueryKeys.work(id),
    queryFn: async () => {
      const data = await WorksApi.getWork(id, token || undefined);
      return {
        work: data.work,
        processingWork: data.processing_work || data.work?.processing_work || null,
      };
    },
  });
}

/**
 * 特定ユーザーの作品一覧を取得するカスタムフック
 * @param userId ユーザーID
 * @param page ページ番号
 * @param limit 1ページあたりの表示件数
 */
export function useUserWorks(userId: string, page: number = 1, limit: number = 20) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: workQueryKeys.userWorks(userId, page, limit),
    queryFn: async () => {
      return await WorksApi.getUserWorks(userId, page, limit, token || undefined);
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

/**
 * 自分の作品一覧を取得するフック
 */
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
    queryKey: workQueryKeys.myWorks,
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

/**
 * コメントを取得するフック
 * @param workId 作品ID
 */
export function useComments(workId: string) {
  return useQuery({
    queryKey: workQueryKeys.comments(workId),
    queryFn: async () => {
      const data = await WorksApi.getComments(workId);
      return data.comments || [];
    },
  });
}

/**
 * いいね状態を取得するフック
 * @param workId 作品ID
 */
export function useLikeStatus(workId: string) {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: workQueryKeys.likes(workId),
    queryFn: async () => {
      if (!isAuthenticated || !token) return { liked: false };

      try {
        return await WorksApi.getLikeStatus(workId, token);
      } catch (error) {
        console.error('いいね状態の取得中にエラー:', error);
        return { liked: false };
      }
    },
    // トークンがある場合のみクエリを実行
    enabled: !!token,
  });
}

/**
 * いいねを切り替えるフック
 */
export function useLikeToggle() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workId, liked }: { workId: string; liked: boolean }) => {
      if (!token) {
        throw new Error('ログインが必要です');
      }

      if (liked) {
        return await WorksApi.removeLike(workId, token);
      } else {
        return await WorksApi.addLike(workId, token);
      }
    },
    onSuccess: (data, variables) => {
      // クエリを無効化して再フェッチを促す
      queryClient.invalidateQueries({ queryKey: workQueryKeys.likes(variables.workId) });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.work(variables.workId) });
    },
  });
}

/**
 * 単一作品のいいねを処理するフック
 */
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
      queryClient.invalidateQueries({ queryKey: workQueryKeys.work(String(workId)) });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.works });
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

/**
 * コメントを追加するフック
 */
export function useAddComment() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workId, commentData }: { workId: string; commentData: CommentInput }) => {
      return await WorksApi.addComment(workId, commentData, token || undefined);
    },
    onSuccess: (data, variables) => {
      // コメントクエリとワーククエリを更新
      queryClient.invalidateQueries({ queryKey: workQueryKeys.comments(variables.workId) });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.work(variables.workId) });
    },
  });
}
