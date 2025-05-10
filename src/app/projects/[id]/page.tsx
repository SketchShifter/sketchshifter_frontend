'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ChevronRightIcon,
  ListBulletIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useProject,
  useProjectTasks,
  useProjectMembers,
  useCreateTask,
  useDeleteProject,
  useUpdateProject,
  useGenerateInvitationCode,
  useRemoveMember,
} from '@/hooks/use-project-hooks';
import { useCurrentUser } from '@/hooks/use-auth';
import { formatDate } from '@/lib/formatDate';
import { motion } from 'framer-motion';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);
  const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');

  const { data: currentUser } = useCurrentUser();
  const { data: projectData, isLoading } = useProject(projectId);
  const { data: tasksData } = useProjectTasks(projectId);
  const { data: membersData } = useProjectMembers(projectId);
  const createTaskMutation = useCreateTask();
  const deleteProjectMutation = useDeleteProject(projectId);
  const updateProjectMutation = useUpdateProject(projectId);
  const generateInvitationMutation = useGenerateInvitationCode(projectId);
  const removeMemberMutation = useRemoveMember(projectId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
          <h2 className="text-xl font-bold">プロジェクトが見つかりません</h2>
          <Link
            href="/projects"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            プロジェクト一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const { project } = projectData;
  const isOwner = currentUser?.id === project.owner.id.toString();
  const tasks = tasksData?.tasks || [];
  const members = membersData?.members || [];

  // プロジェクト編集フォームの初期化
  const openEditModal = () => {
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    setShowEditModal(true);
  };

  // プロジェクト更新ハンドラー
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    await updateProjectMutation.mutateAsync({
      title: editTitle,
      description: editDescription,
    });

    setShowEditModal(false);
  };

  // タスク作成ハンドラー
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await createTaskMutation.mutateAsync({
      title: taskTitle,
      description: taskDescription,
      project_id: projectId,
    });

    setTaskTitle('');
    setTaskDescription('');
    setShowTaskModal(false);
  };

  // 招待コード生成・表示
  const handleShowInvitation = async () => {
    if (project.invitation_code) {
      // 既存の招待コードを表示
      setInvitationCode(project.invitation_code);
      setShowInviteModal(true);
    } else {
      // 新規生成
      const result = await generateInvitationMutation.mutateAsync();
      if (result.invitation_code) {
        setInvitationCode(result.invitation_code);
        setShowInviteModal(true);
      }
    }
  };

  // 招待コードコピー
  const handleCopyInvitation = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };

  // 新しい招待コード生成
  const handleRegenerateInvitation = async () => {
    const result = await generateInvitationMutation.mutateAsync();
    if (result.invitation_code) {
      setInvitationCode(result.invitation_code);
    }
  };

  // メンバー削除ハンドラー
  const handleRemoveMember = async (memberId: number) => {
    if (confirm('このメンバーをプロジェクトから削除しますか？')) {
      await removeMemberMutation.mutateAsync(memberId);
    }
  };

  // プロジェクト削除ハンドラー
  const handleDeleteProject = async () => {
    if (confirm('このプロジェクトを削除しますか？この操作は取り消せません。')) {
      await deleteProjectMutation.mutateAsync();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-4 flex items-center space-x-4">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              {isOwner && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  オーナー
                </span>
              )}
            </div>
            <p className="mb-4 text-gray-600">{project.description || '説明はありません'}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                作成日: {formatDate(project.created_at)}
              </div>
              <div className="flex items-center">
                <UsersIcon className="mr-1 h-4 w-4" />
                メンバー: {members.length}名
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* {isOwner && ( */}
            {true && (
              <>
                <button
                  onClick={handleShowInvitation}
                  disabled={generateInvitationMutation.isPending}
                  className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  {copiedInvite ? (
                    <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                  ) : (
                    <ClipboardDocumentIcon className="mr-2 h-4 w-4" />
                  )}
                  {copiedInvite ? 'コピー済み' : '招待コードを生成'}
                </button>
                <button
                  onClick={openEditModal}
                  className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  編集
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <ListBulletIcon className="mr-2 inline h-4 w-4" />
            タスク ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <UsersIcon className="mr-2 inline h-4 w-4" />
            メンバー ({members.length})
          </button>
        </nav>
      </div>

      {/* コンテンツエリア */}
      {activeTab === 'tasks' ? (
        <div>
          {/* タスク作成ボタン */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              新しいタスク
            </button>
          </div>

          {/* タスク一覧 */}
          {tasks.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <ListBulletIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">タスクがありません</h3>
              <p className="mb-4 text-gray-600">最初のタスクを作成してください。</p>
              <button
                onClick={() => setShowTaskModal(true)}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                タスクを作成
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/projects/${projectId}/tasks/${task.id}`}>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="mb-1 text-lg font-medium text-gray-900">{task.title}</h3>
                          <p className="mb-4 text-sm text-gray-600">
                            {task.description || '説明はありません'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div>作品: {task.works?.length || 0}件</div>
                            <div>投票: {task.votes?.length || 0}件</div>
                            <div>作成日: {formatDate(task.created_at)}</div>
                          </div>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* メンバー一覧 */
        <div>
          {members.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <UsersIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">メンバーがいません</h3>
              <p className="text-gray-600">招待コードを共有してメンバーを招待してください。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white">
                        {member.user.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {member.user.nickname}
                          </h4>
                          {member.is_owner && (
                            <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              オーナー
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          参加日: {formatDate(member.joined_at)}
                        </p>
                      </div>
                    </div>
                    {isOwner && !member.is_owner && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
                        title="メンバーを削除"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 危険な操作 */}
      {isOwner && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-sm font-medium text-gray-900">危険な操作</h3>
          <button
            onClick={handleDeleteProject}
            disabled={deleteProjectMutation.isPending}
            className="flex items-center rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            プロジェクトを削除
          </button>
        </div>
      )}

      {/* タスク作成モーダル */}
      {showTaskModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">新しいタスク</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label
                  htmlFor="task-title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  タスク名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="task-desc" className="mb-1 block text-sm font-medium text-gray-700">
                  説明（任意）
                </label>
                <textarea
                  id="task-desc"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {createTaskMutation.isPending ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* プロジェクト編集モーダル */}
      {showEditModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">プロジェクト編集</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label
                  htmlFor="edit-title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  プロジェクト名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="edit-desc" className="mb-1 block text-sm font-medium text-gray-700">
                  説明（任意）
                </label>
                <textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={updateProjectMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {updateProjectMutation.isPending ? '更新中...' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 招待コードモーダル */}
      {showInviteModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">メンバーを招待</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              以下の招待コードを共有してメンバーを招待してください。
            </p>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <code className="font-mono text-lg text-blue-600">{invitationCode}</code>
                <button
                  onClick={handleCopyInvitation}
                  className={`ml-4 flex items-center rounded px-3 py-1 text-sm ${
                    copiedInvite
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {copiedInvite ? (
                    <>
                      <CheckIcon className="mr-1 h-4 w-4" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="mr-1 h-4 w-4" />
                      コピー
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6 text-sm text-gray-500">
              <h3 className="mb-2 font-medium">招待コードの使い方:</h3>
              <ol className="list-inside list-decimal space-y-1">
                <li>上のコードをコピーして招待したい人に送信</li>
                <li>招待された人はプロジェクト一覧で「参加する」ボタンをクリック</li>
                <li>招待コードを入力して参加</li>
              </ol>
            </div>

            <div className="flex justify-between space-x-4">
              <button
                onClick={handleRegenerateInvitation}
                disabled={generateInvitationMutation.isPending}
                className="flex-1 rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:bg-gray-50"
              >
                {generateInvitationMutation.isPending ? '生成中...' : '新しいコードを生成'}
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
