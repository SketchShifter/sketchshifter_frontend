import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { WorksApi } from '@/lib/api';
import { CommentInput } from '@/types/dataTypes';

// クエリキーを一箇所で定義
export const queryKeys = {
  works: ['works'] as const,
  work: (id: string) => ['work', id] as const,
  comments: (workId: string) => ['comments', workId] as const,
  likes: (workId: string) => ['like-status', workId] as const,
  user: ['currentUser'] as const,
};

// 作品データを取得するフック
export function useWork(id: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.work(id),
    queryFn: async () => {
      const data = await WorksApi.getWork(id, token || undefined);
      return {
        work: data.work,
        processingWork: data.processing_work || data.work?.processing_work || null,
      };
    },
  });
}

// コメントを取得するフック
export function useComments(workId: string) {
  return useQuery({
    queryKey: queryKeys.comments(workId),
    queryFn: async () => {
      const data = await WorksApi.getComments(workId);
      return data.comments || [];
    },
  });
}

// いいね状態を取得するフック
export function useLikeStatus(workId: string) {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.likes(workId),
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

// いいねを切り替えるフック
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
      queryClient.invalidateQueries({ queryKey: queryKeys.likes(variables.workId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.work(variables.workId) });
    },
  });
}

// コメントを追加するフック
export function useAddComment() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workId, commentData }: { workId: string; commentData: CommentInput }) => {
      return await WorksApi.addComment(workId, commentData, token || undefined);
    },
    onSuccess: (data, variables) => {
      // コメントクエリとワーククエリを更新
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(variables.workId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.work(variables.workId) });
    },
  });
}
