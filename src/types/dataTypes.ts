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

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface Work {
  id: number;
  title: string;
  description: string | null;
  pde_content: string;
  js_content: string | null;
  thumbnail_url: string | null;
  thumbnail_type: string | null;
  code_shared: boolean;
  views: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: User;
  tags: Tag[];
  likes_count: number;
  comments_count: number;
}

export interface Comment {
  id: number;
  content: string;
  work_id: number;
  user_id: number | null;
  guest_nickname: string | null;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
  user: User | null;
}

// API レスポンス型
export interface WorkListResponse {
  works: Work[];
  total: number;
  pages: number;
  page: number;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  pages: number;
  page: number;
}

// 認証関連の型定義
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  nickname: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: AuthUser;
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
  sort?: 'newest' | 'popular' | 'likes';
}

// プロジェクト・タスク関連の型定義
export interface Project {
  id: number;
  title: string;
  description: string | null;
  invitation_code: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  owner: User;
  tasks?: Task[];
}

export interface ProjectMember {
  project_id: number;
  user_id: number;
  is_owner: boolean;
  joined_at: string;
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  works?: Work[];
  votes?: Vote[];
}

export interface Vote {
  id: number;
  title: string;
  description: string | null;
  task_id: number;
  multi_select: boolean;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  creator: User;
  options: VoteOption[];
}

export interface VoteOption {
  id: number;
  vote_id: number;
  option_text: string;
  work_id: number | null;
  created_at: string;
  work: Work | null;
  vote_count: number;
}

export interface VoteResponse {
  id: number;
  vote_id: number;
  option_id: number;
  user_id: number;
  created_at: string;
  user: User;
}

// プロジェクト関連のリクエスト型
export interface CreateProjectInput {
  title: string;
  description?: string;
}

export interface UpdateProjectInput {
  title: string;
  description?: string;
}

export interface JoinProjectInput {
  invitation_code: string;
}

// タスク関連のリクエスト型
export interface CreateTaskInput {
  title: string;
  description?: string;
  project_id: number;
}

export interface UpdateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskOrderInput {
  task_ids: number[];
  order_indices: number[];
}

// 投票関連のリクエスト型
export interface CreateVoteInput {
  title: string;
  description?: string;
  task_id: number;
  multi_select?: boolean;
}

export interface UpdateVoteInput {
  title: string;
  description?: string;
  multi_select?: boolean;
}

export interface CreateVoteOptionInput {
  option_text: string;
  work_id?: number;
}

export interface CastVoteInput {
  option_id: number;
}

// API レスポンス型
export interface ProjectsResponse {
  projects: Project[];
  total: number;
  pages: number;
  page: number;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface VotesResponse {
  votes: Vote[];
}

export interface VoteUserVotesResponse {
  votes: VoteResponse[];
}

export interface WorksResponse {
  works: Work[];
  total: number;
  pages: number;
  page: number;
}

// 表示用に最適化した型
export interface CardProps {
  id: number | string;
  title: string;
  date: string;
  description: string;
  username: string;
  thumbnail_url: string;
  views?: number;
  likes_count?: number;
}

export const workToCardProps = (work: Work): CardProps => {
  return {
    id: work.id,
    title: work.title,
    description: work.description || '',
    date: work.created_at,
    username: work.user?.nickname || work.user?.name || '不明',
    thumbnail_url: work.thumbnail_url || '',
    views: work.views || 0,
    likes_count: work.likes_count || 0,
  };
};

// 作品作成・更新リクエスト型
export interface CreateWorkInput {
  title: string;
  description?: string;
  pde_content: string;
  code_shared?: boolean;
  tags?: string;
}

export interface UpdateWorkInput {
  title?: string;
  description?: string;
  pde_content?: string;
  code_shared?: boolean;
  tags?: string;
}

// パスワード変更リクエスト型
export interface PasswordChangeInput {
  current_password: string;
  new_password: string;
}

// プロフィール更新リクエスト型
export interface UpdateProfileInput {
  name?: string;
  nickname?: string;
  bio?: string;
}

// いいね関連のレスポンス型
export interface LikeStatusResponse {
  liked: boolean;
}

export interface LikeActionResponse {
  message?: string;
  likes_count: number;
}

// コメント作成時のレスポンス型
export interface CommentCreateResponse {
  comment: Comment;
}

// 招待コード生成レスポンス型
export interface InvitationCodeResponse {
  invitation_code: string;
}

// エラーレスポンス型
export interface ErrorResponse {
  error: string;
  message?: string;
}

// 成功メッセージレスポンス型
export interface MessageResponse {
  message: string;
}
