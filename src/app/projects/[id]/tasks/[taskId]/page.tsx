'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  ChartBarIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  useTask,
  useTaskWorks,
  useTaskVotes,
  useUpdateTask,
  useDeleteTask,
  useCreateVote,
} from '@/hooks/use-project-hooks';
// import { useCurrentUser } from '@/hooks/use-auth';
import { formatDate } from '@/lib/formatDate';
import WorksCard from '@/components/workscard';
import { workToCardProps } from '@/types/dataTypes';
import { motion } from 'framer-motion';

export default function TaskDetailPage() {
  const params = useParams();
  //   const router = useRouter();
  const projectId = parseInt(params.projectId as string);
  const taskId = parseInt(params.taskId as string);

  const [activeTab, setActiveTab] = useState<'works' | 'votes' | 'comments'>('works');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [voteTitle, setVoteTitle] = useState('');
  const [voteDescription, setVoteDescription] = useState('');
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  //   const { data: currentUser } = useCurrentUser();
  const { data: taskData, isLoading } = useTask(taskId);
  const { data: worksData } = useTaskWorks(taskId);
  const { data: votesData } = useTaskVotes(taskId);
  const updateTaskMutation = useUpdateTask(taskId);
  const deleteTaskMutation = useDeleteTask(taskId);
  const createVoteMutation = useCreateVote();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
          <h2 className="text-xl font-bold">タスクが見つかりません</h2>
          <Link
            href={`/projects/${projectId}`}
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            プロジェクトに戻る
          </Link>
        </div>
      </div>
    );
  }

  const { task } = taskData;
  const works = worksData?.works || [];
  const votes = votesData?.votes || [];

  // タスク編集フォームの初期化
  const openEditModal = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setShowEditModal(true);
  };

  // タスク更新ハンドラー
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    await updateTaskMutation.mutateAsync({
      title: editTitle,
      description: editDescription,
    });

    setShowEditModal(false);
  };

  // タスク削除ハンドラー
  const handleDeleteTask = async () => {
    if (confirm('このタスクを削除しますか？この操作は取り消せません。')) {
      await deleteTaskMutation.mutateAsync();
    }
  };

  // 投票作成ハンドラー
  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voteTitle.trim()) return;

    await createVoteMutation.mutateAsync({
      title: voteTitle,
      description: voteDescription,
      task_id: taskId,
      multi_select: isMultiSelect,
    });

    setVoteTitle('');
    setVoteDescription('');
    setIsMultiSelect(false);
    setShowVoteModal(false);
  };

  const isTaskOwner = true; // TODO: 権限チェックを実装

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずナビ */}
      <nav className="mb-8 flex text-sm text-gray-500">
        <Link href="/projects" className="hover:text-gray-700">
          プロジェクト
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${projectId}`} className="hover:text-gray-700">
          {/* TODO: プロジェクト名を表示 */}
          プロジェクト
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{task.title}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-4 flex items-center space-x-4">
              <Link href={`/projects/${projectId}`} className="text-gray-400 hover:text-gray-600">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold">{task.title}</h1>
            </div>
            <p className="mb-4 text-gray-600">{task.description || '説明はありません'}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                作成日: {formatDate(task.created_at)}
              </div>
              <div className="flex items-center">
                <DocumentIcon className="mr-1 h-4 w-4" />
                作品: {works.length}件
              </div>
              <div className="flex items-center">
                <ChartBarIcon className="mr-1 h-4 w-4" />
                投票: {votes.length}件
              </div>
            </div>
          </div>

          {isTaskOwner && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowVoteModal(true)}
                className="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <ChartBarIcon className="mr-2 h-4 w-4" />
                投票を作成
              </button>
              <button
                onClick={openEditModal}
                className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                編集
              </button>
            </div>
          )}
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('works')}
            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'works'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <DocumentIcon className="mr-2 inline h-4 w-4" />
            作品 ({works.length})
          </button>
          <button
            onClick={() => setActiveTab('votes')}
            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'votes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <ChartBarIcon className="mr-2 inline h-4 w-4" />
            投票 ({votes.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <ChatBubbleLeftEllipsisIcon className="mr-2 inline h-4 w-4" />
            コメント
          </button>
        </nav>
      </div>

      {/* コンテンツエリア */}
      {activeTab === 'works' && (
        <div>
          {/* 作品追加ボタン */}
          <div className="mb-6 flex justify-end">
            <Link
              href={`/mylist/submit?task=${taskId}`}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              作品を追加
            </Link>
          </div>

          {/* 作品一覧 */}
          {works.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <DocumentIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">作品がありません</h3>
              <p className="mb-4 text-gray-600">最初の作品を追加してください。</p>
              <Link
                href={`/mylist/submit?task=${taskId}`}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                作品を追加
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {works.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <WorksCard {...workToCardProps(work)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'votes' && (
        <div>
          {/* 投票一覧 */}
          {votes.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <ChartBarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">投票がありません</h3>
              <p className="mb-4 text-gray-600">投票を作成して意見を集めてください。</p>
              {isTaskOwner && (
                <button
                  onClick={() => setShowVoteModal(true)}
                  className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  <ChartBarIcon className="mr-2 h-4 w-4" />
                  投票を作成
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {votes.map((vote) => (
                <motion.div
                  key={vote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/projects/${projectId}/tasks/${taskId}/votes/${vote.id}`}>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-2 flex items-center space-x-4">
                            <h3 className="text-lg font-medium text-gray-900">{vote.title}</h3>
                            {vote.multi_select && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                複数選択可
                              </span>
                            )}
                            {!vote.is_active && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                終了済み
                              </span>
                            )}
                          </div>
                          <p className="mb-4 text-sm text-gray-600">
                            {vote.description || '説明はありません'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <UserIcon className="mr-1 h-4 w-4" />
                              作成者: {vote.creator.nickname}
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              作成日: {formatDate(vote.created_at)}
                            </div>
                            <div>選択肢: {vote.options?.length}個</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-4 text-sm text-gray-500">
                            投票数:{' '}
                            {vote.options?.reduce((sum, option) => sum + option.vote_count, 0)}票
                          </span>
                          <ChartBarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-6">
          {/* コメント投稿フォーム */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">コメントを投稿</h3>
            <form>
              <div className="mb-4">
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  placeholder="コメントを入力..."
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                投稿する
              </button>
            </form>
          </div>

          {/* コメント一覧 */}
          <div className="space-y-4">
            {/* TODO: コメントの実装 */}
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <ChatBubbleLeftEllipsisIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">コメントがありません</h3>
              <p className="text-gray-600">最初のコメントを投稿してください。</p>
            </div>
          </div>
        </div>
      )}

      {/* 危険な操作 */}
      {isTaskOwner && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-sm font-medium text-gray-900">危険な操作</h3>
          <button
            onClick={handleDeleteTask}
            disabled={deleteTaskMutation.isPending}
            className="flex items-center rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            タスクを削除
          </button>
        </div>
      )}

      {/* タスク編集モーダル */}
      {showEditModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">タスク編集</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="mb-4">
                <label
                  htmlFor="edit-title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  タスク名 <span className="text-red-500">*</span>
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
                  disabled={updateTaskMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {updateTaskMutation.isPending ? '更新中...' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 投票作成モーダル */}
      {showVoteModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">投票を作成</h2>
            <form onSubmit={handleCreateVote}>
              <div className="mb-4">
                <label
                  htmlFor="vote-title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  投票タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="vote-title"
                  value={voteTitle}
                  onChange={(e) => setVoteTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="vote-desc" className="mb-1 block text-sm font-medium text-gray-700">
                  説明（任意）
                </label>
                <textarea
                  id="vote-desc"
                  value={voteDescription}
                  onChange={(e) => setVoteDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isMultiSelect}
                    onChange={(e) => setIsMultiSelect(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">複数選択可能にする</span>
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowVoteModal(false)}
                  className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={createVoteMutation.isPending}
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-green-300"
                >
                  {createVoteMutation.isPending ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
