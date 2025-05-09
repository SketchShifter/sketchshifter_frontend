// データ型定義

export interface User {
  id: number;
  name: string;
  nickname: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessingWork {
  id: number;
  canvas_id: string;
  js_content: string;
  status: string;
  error_message: string;
  original_name: string;
  pde_content: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Work {
  id: string | number;
  title: string;
  description: string;
  file_type?: string;
  file_url?: string;
  thumbnail_url: string;
  code_shared?: boolean;
  code_content?: string;
  views: number;
  created_at: string;
  user: {
    nickname: string;
    name?: string;
    id?: number;
    email?: string;
    bio?: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
  };
  tags?: Tag[];
  likes_count: number;
  comments_count?: number;
  processing_work?: ProcessingWork;
}

export interface Comment {
  id: number;
  content: string;
  user: User | null;
  guest_nickname: string | null;
  is_guest: boolean;
  created_at: string;
}

export interface ApiResponse {
  works: Work[];
  total?: number;
  pages?: number;
  page?: number;
}

// 認証関連の型定義
export interface AuthUser {
  id: string;
  name: string;
  nickname: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// フォーム入力関連の型定義
export interface RegisterInput {
  email: string;
  password: string;
  passwordRe: string;
  name: string;
  nickname: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CommentInput {
  content: string;
  is_guest?: boolean;
  guest_nickname?: string;
}

// ページネーション用の型定義
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 検索用の型定義
export interface SearchParams extends PaginationParams {
  search?: string;
  tag?: string;
  user_id?: number;
  sort?: 'newest' | 'popular' | 'views';
}

// WorksCard用のユーティリティ関数
export function workToCardProps(work: Work) {
  return {
    id: work.id,
    title: work.title,
    date: work.created_at,
    description: work.description,
    username: work.user?.nickname || '不明なユーザー',
    thumbnail: work.thumbnail_url,
    views: work.views,
    likes_count: work.likes_count,
  };
}
