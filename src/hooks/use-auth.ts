import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { AuthApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LoginInput, RegisterInput } from '@/types/dataTypes';
import { toast } from 'react-toastify';

// ログインフック
export function useLogin() {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      return await AuthApi.login(data);
    },
    onSuccess: (data) => {
      // 成功時にZustandストアにユーザー情報とトークンを保存
      // 型変換して必要なプロパティを抽出
      login(data.token, {
        id: String(data.user.id),
        name: data.user.name,
        nickname: data.user.nickname,
        email: data.user.email || '',
      });

      // 成功メッセージをトースト表示
      toast.success(`${data.user.nickname}さん、ようこそ！`);

      // リクエストパラメータからリダイレクト先を取得
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';

      // リダイレクト
      router.push(redirectUrl);

      // 関連クエリのキャッシュをクリア
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      // エラーメッセージをトースト表示
      toast.error(error instanceof Error ? error.message : 'ログインに失敗しました');
    },
  });
}

// 会員登録フック
export function useRegister() {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      return await AuthApi.register(data);
    },
    onSuccess: (data) => {
      // 成功時にZustandストアにユーザー情報とトークンを保存
      // 型変換して必要なプロパティを抽出
      login(data.token, {
        id: String(data.user.id),
        name: data.user.name,
        nickname: data.user.nickname,
        email: data.user.email || '',
      });

      // 成功メッセージをトースト表示
      toast.success('アカウントが正常に作成されました！');

      // ホームページにリダイレクト
      router.push('/');

      // 関連クエリのキャッシュをクリア
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      // エラーメッセージをトースト表示
      toast.error(error instanceof Error ? error.message : '登録に失敗しました');
    },
  });
}

// ログアウトフック
export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    // Zustandストアからユーザー情報とトークンを削除
    logout();

    // ログアウトメッセージをトースト表示
    toast.success('ログアウトしました');

    // 認証が必要なキャッシュをクリア
    queryClient.invalidateQueries();

    // ホームページにリダイレクト
    router.push('/');
  };
}

// 現在のユーザー情報を取得するフック
export function useCurrentUser() {
  const { token, user, login, isAuthenticated } = useAuthStore();
  const [isAuthReady, setIsAuthReady] = useState(false);

  // ユーザー情報をAPIから取得
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!token) throw new Error('No token available');
      return AuthApi.getCurrentUser(token);
    },
    // トークンが存在し、まだユーザー情報がない場合のみクエリを実行
    enabled: !!token && !isAuthenticated,
    retry: 1,
    staleTime: 30 * 60 * 1000, // 30分間キャッシュ
  });

  // 認証準備状況をチェック
  useEffect(() => {
    // ケース1: トークンがなく認証もされていない場合 -> 準備完了
    if (!token && !isAuthenticated) {
      setIsAuthReady(true);
      return;
    }

    // ケース2: すでに認証済みの場合 -> 準備完了
    if (isAuthenticated) {
      setIsAuthReady(true);
      return;
    }

    // ケース3: クエリがロード中でなく、エラーか成功か決まっている場合 -> 準備完了
    if (!isLoading) {
      setIsAuthReady(true);
      return;
    }
  }, [token, isAuthenticated, isLoading, error]);

  // ユーザー情報が取得できたらZustandストアを更新
  useEffect(() => {
    if (data && token && !isAuthenticated) {
      login(token, data);
    }
  }, [data, token, login, isAuthenticated]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAuthReady, // 認証チェックが完了したかどうか
  };
}
