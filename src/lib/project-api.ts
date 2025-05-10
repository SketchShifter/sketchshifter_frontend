import {
  Project,
  Task,
  Vote,
  VoteOption,
  // VoteResponse,
  ProjectMember,
  CreateProjectInput,
  UpdateProjectInput,
  JoinProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskOrderInput,
  CreateVoteInput,
  UpdateVoteInput,
  CreateVoteOptionInput,
  CastVoteInput,
  ProjectsResponse,
  TasksResponse,
  VotesResponse,
  VoteUserVotesResponse,
  WorksResponse,
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

  // 204 No Contentの場合は空オブジェクトを返す
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}

/**
 * プロジェクト関連API
 */
export const ProjectApi = {
  // プロジェクト一覧を取得
  getProjects: (page = 1, limit = 20, search?: string, token?: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    if (search) queryParams.append('search', search);

    const query = `?${queryParams.toString()}`;
    return fetchApi<ProjectsResponse>(`/projects${query}`, { token });
  },

  // 自分が参加しているプロジェクト一覧を取得
  getMyProjects: (page = 1, limit = 20, token: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    const query = `?${queryParams.toString()}`;
    return fetchApi<ProjectsResponse>(`/projects/my${query}`, { token });
  },

  // プロジェクトを作成
  createProject: (data: CreateProjectInput, token: string) => {
    return fetchApi<{ project: Project }>('/projects', {
      method: 'POST',
      body: data,
      token,
    });
  },

  // 招待コードでプロジェクトに参加
  joinProject: (data: JoinProjectInput, token: string) => {
    return fetchApi<{ project: Project }>('/projects/join', {
      method: 'POST',
      body: data,
      token,
    });
  },

  // プロジェクト詳細を取得
  getProject: (id: number, token: string) => {
    return fetchApi<{ project: Project }>(`/projects/${id}`, { token });
  },

  // プロジェクトを更新
  updateProject: (id: number, data: UpdateProjectInput, token: string) => {
    return fetchApi<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  },

  // プロジェクトを削除
  deleteProject: (id: number, token: string) => {
    return fetchApi<void>(`/projects/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  // プロジェクトメンバー一覧を取得
  getProjectMembers: (id: number, token: string) => {
    return fetchApi<{ members: ProjectMember[] }>(`/projects/${id}/members`, { token });
  },

  // メンバーをプロジェクトから削除
  removeMember: (projectId: number, memberId: number, token: string) => {
    return fetchApi<void>(`/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
      token,
    });
  },

  // 招待コードを生成
  generateInvitationCode: (id: number, token: string) => {
    return fetchApi<{ invitation_code: string }>(`/projects/${id}/invitation-code`, {
      method: 'POST',
      token,
    });
  },
};

/**
 * タスク関連API
 */
export const TaskApi = {
  // タスクを作成
  createTask: (data: CreateTaskInput, token: string) => {
    return fetchApi<{ task: Task }>('/tasks', {
      method: 'POST',
      body: data,
      token,
    });
  },

  // タスクを取得
  getTask: (id: number, token: string) => {
    return fetchApi<{ task: Task }>(`/tasks/${id}`, { token });
  },

  // タスクを更新
  updateTask: (id: number, data: UpdateTaskInput, token: string) => {
    return fetchApi<{ task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  },

  // タスクを削除
  deleteTask: (id: number, token: string) => {
    return fetchApi<void>(`/tasks/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  // プロジェクトのタスク一覧を取得
  getProjectTasks: (projectId: number, token: string) => {
    return fetchApi<TasksResponse>(`/tasks/project/${projectId}`, { token });
  },

  // タスクの作品一覧を取得
  getTaskWorks: (id: number, page = 1, limit = 20, token: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    const query = `?${queryParams.toString()}`;
    return fetchApi<WorksResponse>(`/tasks/${id}/works${query}`, { token });
  },

  // 作品をタスクに追加
  addWorkToTask: (taskId: number, workId: number, token: string) => {
    return fetchApi<void>(`/tasks/${taskId}/works`, {
      method: 'POST',
      body: { work_id: workId },
      token,
    });
  },

  // 作品をタスクから削除
  removeWorkFromTask: (taskId: number, workId: number, token: string) => {
    return fetchApi<void>(`/tasks/${taskId}/works/${workId}`, {
      method: 'DELETE',
      token,
    });
  },

  // タスクの表示順序を更新
  updateTaskOrder: (data: UpdateTaskOrderInput, token: string) => {
    return fetchApi<void>('/tasks/orders', {
      method: 'PUT',
      body: data,
      token,
    });
  },
};

/**
 * 投票関連API
 */
export const VoteApi = {
  // 投票を作成
  createVote: (data: CreateVoteInput, token: string) => {
    return fetchApi<{ vote: Vote }>('/votes', {
      method: 'POST',
      body: data,
      token,
    });
  },

  // 投票を取得
  getVote: (id: number, token: string) => {
    return fetchApi<{ vote: Vote }>(`/votes/${id}`, { token });
  },

  // 投票を更新
  updateVote: (id: number, data: UpdateVoteInput, token: string) => {
    return fetchApi<{ vote: Vote }>(`/votes/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  },

  // 投票を削除
  deleteVote: (id: number, token: string) => {
    return fetchApi<void>(`/votes/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  // タスクの投票一覧を取得
  getTaskVotes: (taskId: number, token: string) => {
    return fetchApi<VotesResponse>(`/votes/task/${taskId}`, { token });
  },

  // 投票オプションを追加
  addVoteOption: (voteId: number, data: CreateVoteOptionInput, token: string) => {
    return fetchApi<{ option: VoteOption }>(`/votes/${voteId}/options`, {
      method: 'POST',
      body: data,
      token,
    });
  },

  // 投票オプションを削除
  removeVoteOption: (voteId: number, optionId: number, token: string) => {
    return fetchApi<void>(`/votes/${voteId}/options/${optionId}`, {
      method: 'DELETE',
      token,
    });
  },

  // 投票する
  castVote: (voteId: number, data: CastVoteInput, token: string) => {
    return fetchApi<void>(`/votes/${voteId}/vote`, {
      method: 'POST',
      body: data,
      token,
    });
  },

  // 投票を取り消す
  removeVote: (voteId: number, optionId: number, token: string) => {
    return fetchApi<void>(`/votes/${voteId}/vote/${optionId}`, {
      method: 'DELETE',
      token,
    });
  },

  // ユーザーの投票状況を取得
  getUserVotes: (voteId: number, token: string) => {
    return fetchApi<VoteUserVotesResponse>(`/votes/${voteId}/user-votes`, { token });
  },

  // 投票を終了
  closeVote: (voteId: number, token: string) => {
    return fetchApi<void>(`/votes/${voteId}/close`, {
      method: 'POST',
      token,
    });
  },
};
