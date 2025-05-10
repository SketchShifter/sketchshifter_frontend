import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { ProjectApi, TaskApi, VoteApi } from '@/lib/project-api';
import {
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
} from '@/types/dataTypes';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// クエリキーを一箇所で定義
export const projectQueryKeys = {
  projects: ['projects'] as const,
  project: (id: number) => ['project', id] as const,
  projectMembers: (id: number) => ['project-members', id] as const,
  myProjects: ['my-projects'] as const,
  tasks: (projectId: number) => ['tasks', projectId] as const,
  task: (id: number) => ['task', id] as const,
  taskWorks: (id: number, page: number, limit: number) => ['task-works', id, page, limit] as const,
  votes: (taskId: number) => ['votes', taskId] as const,
  vote: (id: number) => ['vote', id] as const,
  userVotes: (voteId: number) => ['user-votes', voteId] as const,
};

/**
 * プロジェクト関連のフック
 */
export function useProjects(page = 1, limit = 20, search?: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: [...projectQueryKeys.projects, page, limit, search],
    queryFn: async () => {
      return await ProjectApi.getProjects(page, limit, search, token || undefined);
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

export function useMyProjects(page = 1, limit = 20) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: [...projectQueryKeys.myProjects, page, limit],
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.getMyProjects(page, limit, token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

export function useProject(id: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: projectQueryKeys.project(id),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.getProject(id, token);
    },
    enabled: !!token,
  });
}

export function useProjectMembers(id: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: projectQueryKeys.projectMembers(id),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.getProjectMembers(id, token);
    },
    enabled: !!token,
  });
}

export function useCreateProject() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.createProject(data, token);
    },
    onSuccess: (data) => {
      toast.success('プロジェクトを作成しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projects });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.myProjects });
      router.push(`/projects/${data.project.id}`);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('プロジェクトの作成に失敗しました');
      }
    },
  });
}

export function useJoinProject() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: JoinProjectInput) => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.joinProject(data, token);
    },
    onSuccess: (data) => {
      toast.success('プロジェクトに参加しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projects });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.myProjects });
      router.push(`/projects/${data.project.id}`);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('プロジェクトへの参加に失敗しました');
      }
    },
  });
}

export function useUpdateProject(id: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectInput) => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.updateProject(id, data, token);
    },
    onSuccess: () => {
      toast.success('プロジェクトを更新しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.project(id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projects });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.myProjects });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('プロジェクトの更新に失敗しました');
      }
    },
  });
}

export function useDeleteProject(id: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.deleteProject(id, token);
    },
    onSuccess: () => {
      toast.success('プロジェクトを削除しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projects });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.myProjects });
      router.push('/projects');
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('プロジェクトの削除に失敗しました');
      }
    },
  });
}

export function useRemoveMember(projectId: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: number) => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.removeMember(projectId, memberId, token);
    },
    onSuccess: () => {
      toast.success('メンバーを削除しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectMembers(projectId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('メンバーの削除に失敗しました');
      }
    },
  });
}

export function useGenerateInvitationCode(id: number) {
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await ProjectApi.generateInvitationCode(id, token);
    },
    onSuccess: (data) => {
      toast.success('招待コードを生成しました');
      navigator.clipboard.writeText(data.invitation_code);
      toast.info('招待コードをクリップボードにコピーしました');
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('招待コードの生成に失敗しました');
      }
    },
  });
}

/**
 * タスク関連のフック
 */
export function useProjectTasks(projectId: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: projectQueryKeys.tasks(projectId),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await TaskApi.getProjectTasks(projectId, token);
    },
    enabled: !!token,
  });
}

export function useTask(id: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: projectQueryKeys.task(id),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await TaskApi.getTask(id, token);
    },
    enabled: !!token,
  });
}

export function useCreateTask() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      if (!token) throw new Error('認証が必要です');
      return await TaskApi.createTask(data, token);
    },
    onSuccess: (data, variables) => {
      toast.success('タスクを作成しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasks(variables.project_id) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('タスクの作成に失敗しました');
      }
    },
  });
}

export function useUpdateTask(id: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTaskInput) => {
      if (!token) throw new Error('認証が必要です');
      return await TaskApi.updateTask(id, data, token);
    },
    onSuccess: (data) => {
      toast.success('タスクを更新しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.task(id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasks(data.task.project_id) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('タスクの更新に失敗しました');
      }
    },
  });
}

export function useDeleteTask(id: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('認証が必要です');
      const task = await TaskApi.getTask(id, token);
      await TaskApi.deleteTask(id, token);
      return task.task.project_id;
    },
    onSuccess: (projectId) => {
      toast.success('タスクを削除しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasks(projectId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('タスクの削除に失敗しました');
      }
    },
  });
}

export function useTaskWorks(id: number, page = 1, limit = 20) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: projectQueryKeys.taskWorks(id, page, limit),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await TaskApi.getTaskWorks(id, page, limit, token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}

export function useAddWorkToTask(taskId: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workId: number) => {
      if (!token) throw new Error('認証が必要です');
      return await TaskApi.addWorkToTask(taskId, workId, token);
    },
    onSuccess: () => {
      toast.success('作品をタスクに追加しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskWorks(taskId, 1, 20) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.task(taskId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('作品の追加に失敗しました');
      }
    },
  });
}

export function useRemoveWorkFromTask(taskId: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workId: number) => {
      if (!token) throw new Error('認証が必要です');
      return await TaskApi.removeWorkFromTask(taskId, workId, token);
    },
    onSuccess: () => {
      toast.success('作品をタスクから削除しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskWorks(taskId, 1, 20) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.task(taskId) });
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

export function useUpdateTaskOrder() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTaskOrderInput) => {
      if (!token) throw new Error('認証が必要です');
      return await TaskApi.updateTaskOrder(data, token);
    },
    onSuccess: () => {
      toast.success('タスクの順序を更新しました');
      // すべてのプロジェクトのタスクをキャッシュから削除
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('タスク順序の更新に失敗しました');
      }
    },
  });
}

/**
 * 投票関連のフック
 */
export function useTaskVotes(taskId: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: projectQueryKeys.votes(taskId),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.getTaskVotes(taskId, token);
    },
    enabled: !!token,
  });
}

export function useVote(id: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: projectQueryKeys.vote(id),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.getVote(id, token);
    },
    enabled: !!token,
  });
}

export function useCreateVote() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVoteInput) => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.createVote(data, token);
    },
    onSuccess: (data, variables) => {
      toast.success('投票を作成しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.votes(variables.task_id) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('投票の作成に失敗しました');
      }
    },
  });
}

export function useUpdateVote(id: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateVoteInput) => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.updateVote(id, data, token);
    },
    onSuccess: (data) => {
      toast.success('投票を更新しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.vote(id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.votes(data.vote.task_id) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('投票の更新に失敗しました');
      }
    },
  });
}

export function useDeleteVote(id: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('認証が必要です');
      const vote = await VoteApi.getVote(id, token);
      await VoteApi.deleteVote(id, token);
      return vote.vote.task_id;
    },
    onSuccess: (taskId) => {
      toast.success('投票を削除しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.votes(taskId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('投票の削除に失敗しました');
      }
    },
  });
}

export function useAddVoteOption(voteId: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVoteOptionInput) => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.addVoteOption(voteId, data, token);
    },
    onSuccess: () => {
      toast.success('投票選択肢を追加しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.vote(voteId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('選択肢の追加に失敗しました');
      }
    },
  });
}

export function useRemoveVoteOption(voteId: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (optionId: number) => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.removeVoteOption(voteId, optionId, token);
    },
    onSuccess: () => {
      toast.success('投票選択肢を削除しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.vote(voteId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('選択肢の削除に失敗しました');
      }
    },
  });
}

export function useCastVote(voteId: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CastVoteInput) => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.castVote(voteId, data, token);
    },
    onSuccess: () => {
      toast.success('投票しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.vote(voteId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.userVotes(voteId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('投票に失敗しました');
      }
    },
  });
}

export function useRemoveVote(voteId: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (optionId: number) => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.removeVote(voteId, optionId, token);
    },
    onSuccess: () => {
      toast.success('投票を取り消しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.vote(voteId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.userVotes(voteId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('投票の取り消しに失敗しました');
      }
    },
  });
}

export function useUserVotes(voteId: number) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: projectQueryKeys.userVotes(voteId),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.getUserVotes(voteId, token);
    },
    enabled: !!token,
  });
}

export function useCloseVote(voteId: number) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('認証が必要です');
      return await VoteApi.closeVote(voteId, token);
    },
    onSuccess: () => {
      toast.success('投票を終了しました');
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.vote(voteId) });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('投票の終了に失敗しました');
      }
    },
  });
}
