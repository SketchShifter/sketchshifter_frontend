import {
  Work,
  AuthUser,
  AuthResponse,
  CommentInput,
  SearchParams,
  RegisterInput,
  LoginInput,
  WorkListResponse,
  CommentListResponse,
  LikeStatusResponse,
  LikeActionResponse,
  PasswordChangeInput,
  UpdateProfileInput,
  MessageResponse,
  CommentCreateResponse,
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

  // デバッグログを追加
  console.log('API Request:', {
    endpoint: `${API_BASE_URL}${endpoint}`,
    method,
    token: token ? '存在します' : 'なし',
    body,
  });

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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    // レスポンスのデバッグログを追加
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `API error with status ${response.status}`);
    }

    // 204 No Contentの場合は空オブジェクトを返す
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    console.log('API Success:', data);
    return data;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
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
        if (value !== undefined && value !== null) queryParams.append(key, String(value));
      });
    }

    const query = queryParams.toString() ? `?${queryParams}` : '';
    return fetchApi<WorkListResponse>(`/works${query}`, { token });
  },

  // 特定の作品詳細の取得
  getWork: (id: string | number, token?: string) => {
    return fetchApi<{ work: Work }>(`/works/${id}`, { token });
  },

  // いいね状態の確認
  getLikeStatus: (workId: string | number, token: string) => {
    return fetchApi<LikeStatusResponse>(`/works/${workId}/liked`, { token });
  },

  // いいねの追加
  addLike: (workId: string | number, token: string) => {
    return fetchApi<LikeActionResponse>(`/works/${workId}/like`, {
      method: 'POST',
      token,
    });
  },

  // いいねの解除
  removeLike: (workId: string | number, token: string) => {
    return fetchApi<LikeActionResponse>(`/works/${workId}/like`, {
      method: 'DELETE',
      token,
    });
  },

  // コメントの取得
  getComments: (workId: string | number, page = 1, limit = 20) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    const query = `?${queryParams.toString()}`;
    return fetchApi<CommentListResponse>(`/works/${workId}/comments${query}`);
  },

  // コメントの追加
  addComment: (workId: string | number, data: CommentInput, token?: string) => {
    return fetchApi<CommentCreateResponse>(`/works/${workId}/comments`, {
      method: 'POST',
      body: data,
      token,
    });
  },

  // 特定ユーザーの作品一覧を取得
  getUserWorks: (userId: string | number, page: number = 1, limit: number = 20, token?: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    const query = `?${queryParams.toString()}`;
    return fetchApi<WorkListResponse>(`/users/${userId}/works${query}`, { token });
  },

  // 作品の作成
  createWork: (formData: FormData, token: string) => {
    console.log('API createWork called with FormData:', formData);

    // FormDataの内容をログに出力
    console.log('FormData contents:');
    for (const pair of formData.entries()) {
      console.log(
        `${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].type})` : pair[1]}`
      );
    }

    // FormDataを使用するためfetchApiではなく直接fetchを使用
    return new Promise<{ work: Work }>(async (resolve, reject) => {
      try {
        const response = await fetch(`${API_BASE_URL}/works`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Typeはブラウザが自動的に設定するため省略
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `API error with status ${response.status}`);
        }

        const data = await response.json();
        resolve(data);
      } catch (error) {
        console.error('API Request Failed:', error);
        reject(error);
      }
    });
  },

  // 作品の更新
  updateWork: (id: string | number, formData: FormData, token: string) => {
    return new Promise<{ work: Work }>(async (resolve, reject) => {
      try {
        const response = await fetch(`${API_BASE_URL}/works/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `API error with status ${response.status}`);
        }

        const data = await response.json();
        resolve(data);
      } catch (error) {
        console.error('API Request Failed:', error);
        reject(error);
      }
    });
  },

  // 作品の削除
  deleteWork: (id: string | number, token: string) => {
    return fetchApi<void>(`/works/${id}`, {
      method: 'DELETE',
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

  // パスワード変更
  changePassword: (data: PasswordChangeInput, token: string) => {
    return fetchApi<MessageResponse>('/auth/change-password', {
      method: 'POST',
      body: data,
      token,
    });
  },
};

/**
 * ユーザー関連API
 */
export const UsersApi = {
  // ユーザー情報取得
  getUser: (userId: string | number, token?: string) => {
    return fetchApi<{ user: AuthUser }>(`/users/${userId}`, { token });
  },

  // プロフィール更新
  updateProfile: (data: UpdateProfileInput, token: string) => {
    return fetchApi<{ user: AuthUser }>(`/users/profile`, {
      method: 'PUT',
      body: data,
      token,
    });
  },
};

/**
 * コメント関連API
 */
export const CommentsApi = {
  // コメント更新
  updateComment: (id: number, data: { content: string }, token: string) => {
    return fetchApi<CommentCreateResponse>(`/comments/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  },

  // コメント削除
  deleteComment: (id: number, token: string) => {
    return fetchApi<void>(`/comments/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

/**
 * タグ関連API
 */
export const TagsApi = {
  // タグ一覧取得
  getTags: (search?: string, limit = 50) => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    queryParams.append('limit', String(limit));

    const query = `?${queryParams.toString()}`;
    return fetchApi<{ tags: Array<{ id: number; name: string; created_at: string }> }>(
      `/tags${query}`
    );
  },
};
