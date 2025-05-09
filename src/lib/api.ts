import {
  Work,
  Comment,
  AuthUser,
  AuthResponse,
  CommentInput,
  SearchParams,
  RegisterInput,
  LoginInput,
  ProcessingWork,
} from '@/types/dataTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.serendicode-sub.click';

// API関数のパラメータ型
type ApiOptions<T = unknown> = {
  token?: string | null;
  method?: string;
  body?: T;
  headers?: Record<string, string>;
};

/**
 * 基本的なAPI呼び出し関数
 */
async function fetchApi<T, B = unknown>(endpoint: string, options: ApiOptions<B> = {}): Promise<T> {
  const { token, method = 'GET', body, headers = {} } = options;

  // ヘッダーを作成
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Content-Type', 'application/json');

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

  if (!response.ok) {
    // レスポンスからエラーメッセージを抽出
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error with status ${response.status}`);
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(`API error with status ${response.status}`);
    }
  }

  return await response.json();
}

/**
 * 作品関連API
 */
export const WorksApi = {
  // 作品一覧の取得
  getWorks: (params?: SearchParams, token?: string) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    const query = queryParams.toString() ? `?${queryParams}` : '';
    return fetchApi<{ works: Work[]; total: number; pages: number }>(`/works${query}`, { token });
  },

  // 特定の作品詳細の取得
  getWork: (id: string, token?: string) => {
    return fetchApi<{ work: Work; processing_work?: ProcessingWork }>(`/works/${id}`, { token });
  },

  // いいね状態の確認
  getLikeStatus: (workId: string, token: string) => {
    return fetchApi<{ liked: boolean }>(`/works/${workId}/liked`, { token });
  },

  // いいねの追加
  addLike: (workId: string, token: string) => {
    return fetchApi<{ message: string; likes_count: number }>(`/works/${workId}/like`, {
      method: 'POST',
      token,
    });
  },

  // いいねの解除
  removeLike: (workId: string, token: string) => {
    return fetchApi<{ message: string; likes_count: number }>(`/works/${workId}/like`, {
      method: 'DELETE',
      token,
    });
  },

  // コメントの取得
  getComments: (workId: string) => {
    return fetchApi<{ comments: Comment[] }>(`/works/${workId}/comments`);
  },

  // コメントの追加
  addComment: (workId: string, data: CommentInput, token?: string) => {
    return fetchApi<{ comment: Comment }>(`/works/${workId}/comments`, {
      method: 'POST',
      body: data,
      token,
    });
  },
};

/**
 * 認証関連API
 */
export const AuthApi = {
  // ログイン
  login: (data: LoginInput) => {
    return fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: data,
    });
  },

  // 会員登録
  register: (data: RegisterInput) => {
    return fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  // 現在のユーザー情報取得
  getCurrentUser: (token: string) => {
    return fetchApi<AuthUser>('/auth/me', { token });
  },
};

/**
 * ユーザー関連API
 */
export const UsersApi = {
  // ユーザープロフィール取得
  getProfile: (userId: string, token?: string) => {
    return fetchApi<{ user: AuthUser; works: Work[] }>(`/users/${userId}`, { token });
  },

  // プロフィール更新
  updateProfile: (userId: string, data: AuthUser, token: string) => {
    return fetchApi<{ user: AuthUser }>(`/users/${userId}`, {
      method: 'PUT',
      body: data,
      token,
    });
  },
};
