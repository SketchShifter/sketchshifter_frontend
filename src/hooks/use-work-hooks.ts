import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { WorksApi } from '@/lib/api';
import { CommentInput, SearchParams } from '@/types/dataTypes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-auth';
import { toast } from 'react-toastify';

// クエリキーを一箇所で定義
export const workQueryKeys = {
  works: ['works'] as const,
  work: (id: string | number) => ['work', String(id)] as const,
  userWorks: (userId: string | number, page: number, limit: number) =>
    ['user-works', String(userId), page, limit] as const,
  myWorks: ['my-works'] as const,
  comments: (workId: string | number) => ['comments', String(workId)] as const,
  likes: (workId: string | number) => ['like-status', String(workId)] as const,
};

/**
 * 作品一覧を取得するためのカスタムフック
 * @param params 検索パラメータ
 */
export function useWorks(params?: SearchParams) {
  return useQuery({
    queryKey: [...workQueryKeys.works, params],
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
export function useWork(id: string | number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: workQueryKeys.work(id),
    queryFn: async () => {
      const data = await WorksApi.getWork(id, token || undefined);
      return data;
    },
  });
}

/**
 * 特定ユーザーの作品一覧を取得するカスタムフック
 * @param userId ユーザーID
 * @param page ページ番号
 * @param limit 1ページあたりの表示件数
 */
export function useUserWorks(userId: string | number, page: number = 1, limit: number = 20) {
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
  const { isAuthReady, user } = useCurrentUser();
  const router = useRouter();

  // ユーザーがログインしていない場合、ログインページにリダイレクト
  useEffect(() => {
    // 認証チェックが完了した後にのみリダイレクト
    if (isAuthReady && !isAuthenticated && token === null) {
      router.push('/login?redirect=/mylist');
    }
  }, [isAuthenticated, token, router, isAuthReady]);

  return useQuery({
    queryKey: [...workQueryKeys.myWorks, token],
    queryFn: async () => {
      if (!token || !user?.id) {
        throw new Error('認証が必要です');
      }

      // 現在のユーザーIDを使用して作品一覧を取得
      const data = await WorksApi.getUserWorks(user.id, 1, 100, token);
      return {
        works: data.works,
        total: data.total,
        pages: data.pages,
        page: data.page,
      };
    },
    enabled: !!token && isAuthenticated && !!user?.id,
    staleTime: 30 * 60 * 1000, // 30分間キャッシュ
  });
}

/**
 * コメントを取得するフック
 * @param workId 作品ID
 */
export function useComments(workId: string | number) {
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
export function useLikeStatus(workId: string | number) {
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
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ workId, liked }: { workId: string | number; liked: boolean }) => {
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
      queryClient.invalidateQueries({ queryKey: workQueryKeys.works });
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'ログインが必要です') {
        toast.error('ログインが必要です。');
        router.push('/login');
      } else {
        toast.error('エラーが発生しました。');
      }
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

      // いいね状態を確認
      const likeStatus = await WorksApi.getLikeStatus(workId, token);

      // いいね状態に応じて追加または削除
      if (likeStatus.liked) {
        return await WorksApi.removeLike(workId, token);
      } else {
        return await WorksApi.addLike(workId, token);
      }
    },
    onSuccess: (data, workId) => {
      // 関連するデータのキャッシュを更新
      queryClient.invalidateQueries({ queryKey: workQueryKeys.work(workId) });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.likes(workId) });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.works });

      // いいね数を表示するために toastを調整
      const message = data.likes_count
        ? `いいねしました！（${data.likes_count}）`
        : 'いいねを取り消しました';
      toast.success(message);
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
    mutationFn: async ({
      workId,
      commentData,
    }: {
      workId: string | number;
      commentData: CommentInput;
    }) => {
      return await WorksApi.addComment(workId, commentData, token || undefined);
    },
    onSuccess: (data, variables) => {
      // コメントクエリとワーククエリを更新
      queryClient.invalidateQueries({ queryKey: workQueryKeys.comments(variables.workId) });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.work(variables.workId) });
    },
  });
}

/**
 * 作品をアップロードするフック
 */
export function useCreateWork() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!token) {
        throw new Error('認証が必要です');
      }
      return await WorksApi.createWork(formData, token);
    },
    onSuccess: (data) => {
      // 成功メッセージを表示
      toast.success('作品をアップロードしました');

      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: workQueryKeys.works });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.myWorks });

      // 作品詳細ページにリダイレクト
      if (data && data.work && data.work.id) {
        router.push(`/artworks/${data.work.id}`);
      } else {
        console.error('レスポンスにwork.idが含まれていません', data);
        router.push('/mylist');
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('作品のアップロードに失敗しました');
      }
    },
  });
}

/**
 * 作品を更新するフック
 */
export function useUpdateWork() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ workId, formData }: { workId: string | number; formData: FormData }) => {
      if (!token) {
        throw new Error('認証が必要です');
      }
      return await WorksApi.updateWork(workId, formData, token);
    },
    onSuccess: (data, variables) => {
      // 成功メッセージを表示
      toast.success('作品を更新しました');

      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: workQueryKeys.work(variables.workId) });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.works });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.myWorks });

      // 作品詳細ページにリダイレクト
      router.push(`/artworks/${variables.workId}`);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('作品の更新に失敗しました');
      }
    },
  });
}

/**
 * 作品を削除するフック
 */
export function useDeleteWork() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (workId: string | number) => {
      if (!token) {
        throw new Error('認証が必要です');
      }
      return await WorksApi.deleteWork(workId, token);
    },
    onSuccess: (data, workId) => {
      // 成功メッセージを表示
      toast.success('作品を削除しました');

      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: workQueryKeys.works });
      queryClient.invalidateQueries({ queryKey: workQueryKeys.myWorks });
      queryClient.removeQueries({ queryKey: workQueryKeys.work(workId) });

      // マイリストページにリダイレクト
      router.push('/mylist');
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('作品の削除に失敗しました');
      }
    },
  });
}
