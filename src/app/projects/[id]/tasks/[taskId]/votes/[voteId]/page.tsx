'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
  ChartBarIcon,
  TrashIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import {
  useVote,
  useUserVotes,
  useCastVote,
  useRemoveVote,
  useAddVoteOption,
  useRemoveVoteOption,
  useCloseVote,
  useDeleteVote,
  useUpdateVote,
} from '@/hooks/use-project-hooks';
import { useCurrentUser } from '@/hooks/use-auth';
import { formatDate } from '@/lib/formatDate';
import { motion } from 'framer-motion';

export default function VoteDetailPage() {
  const params = useParams();
  const projectId = parseInt(params.projectId as string);
  const taskId = parseInt(params.taskId as string);
  const voteId = parseInt(params.voteId as string);

  const [showAddOptionModal, setShowAddOptionModal] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionWorkId, setNewOptionWorkId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMultiSelect, setEditMultiSelect] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: voteData, isLoading } = useVote(voteId);
  const { data: userVotesData } = useUserVotes(voteId);
  const castVoteMutation = useCastVote(voteId);
  const removeVoteMutation = useRemoveVote(voteId);
  const addOptionMutation = useAddVoteOption(voteId);
  const removeOptionMutation = useRemoveVoteOption(voteId);
  const closeVoteMutation = useCloseVote(voteId);
  const deleteVoteMutation = useDeleteVote(voteId);
  const updateVoteMutation = useUpdateVote(voteId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!voteData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
          <h2 className="text-xl font-bold">投票が見つかりません</h2>
          <Link
            href={`/projects/${projectId}/tasks/${taskId}`}
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            タスクに戻る
          </Link>
        </div>
      </div>
    );
  }

  const { vote } = voteData;
  const userVotes = userVotesData?.votes || [];
  const userVotedOptionIds = userVotes.map((v) => v.option_id);
  const totalVotes = vote.options.reduce((sum, option) => sum + option.vote_count, 0);
  const isVoteCreator = currentUser?.id === vote.creator.id.toString();

  // 投票編集フォームの初期化
  const openEditModal = () => {
    setEditTitle(vote.title);
    setEditDescription(vote.description || '');
    setEditMultiSelect(vote.multi_select);
    setShowEditModal(true);
  };

  // 投票更新ハンドラー
  const handleUpdateVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    await updateVoteMutation.mutateAsync({
      title: editTitle,
      description: editDescription,
      multi_select: editMultiSelect,
    });

    setShowEditModal(false);
  };

  // 投票ハンドラー
  const handleVote = async (optionId: number) => {
    if (!currentUser) return;

    const isAlreadyVoted = userVotedOptionIds.includes(optionId);

    if (isAlreadyVoted) {
      // 投票取り消し
      await removeVoteMutation.mutateAsync(optionId);
    } else {
      // 投票実行
      await castVoteMutation.mutateAsync({ option_id: optionId });
    }
  };

  // オプション追加ハンドラー
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionText.trim()) return;

    await addOptionMutation.mutateAsync({
      option_text: newOptionText,
      work_id: newOptionWorkId || undefined,
    });

    setNewOptionText('');
    setNewOptionWorkId(null);
    setShowAddOptionModal(false);
  };

  // オプション削除ハンドラー
  const handleRemoveOption = async (optionId: number) => {
    if (confirm('この選択肢を削除しますか？')) {
      await removeOptionMutation.mutateAsync(optionId);
    }
  };

  // 投票終了ハンドラー
  const handleCloseVote = async () => {
    if (confirm('この投票を終了しますか？終了後は新たな投票ができなくなります。')) {
      await closeVoteMutation.mutateAsync();
    }
  };

  // 投票削除ハンドラー
  const handleDeleteVote = async () => {
    if (confirm('この投票を削除しますか？この操作は取り消せません。')) {
      await deleteVoteMutation.mutateAsync();
    }
  };

  // パーセント計算
  const getPercentage = (count: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  // 結果をソート（投票数順）
  const sortedOptions = [...vote.options].sort((a, b) => b.vote_count - a.vote_count);

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
        <Link href={`/projects/${projectId}/tasks/${taskId}`} className="hover:text-gray-700">
          {/* TODO: タスク名を表示 */}
          タスク
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{vote.title}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-4 flex items-center space-x-4">
              <Link
                href={`/projects/${projectId}/tasks/${taskId}`}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold">{vote.title}</h1>
              {vote.multi_select && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  複数選択可
                </span>
              )}
              {!vote.is_active && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                  終了済み
                </span>
              )}
            </div>
            <p className="mb-4 text-gray-600">{vote.description || '説明はありません'}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <UserIcon className="mr-1 h-4 w-4" />
                作成者: {vote.creator.nickname}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                {formatDate(vote.created_at)}
              </div>
              {vote.closed_at && (
                <div className="flex items-center">
                  <StopIcon className="mr-1 h-4 w-4" />
                  終了日: {formatDate(vote.closed_at)}
                </div>
              )}
            </div>
          </div>

          {isVoteCreator && (
            <div className="flex items-center space-x-4">
              {vote.is_active && (
                <>
                  <button
                    onClick={() => setShowAddOptionModal(true)}
                    className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    選択肢を追加
                  </button>
                  <button
                    onClick={handleCloseVote}
                    disabled={closeVoteMutation.isPending}
                    className="flex items-center rounded-md bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                  >
                    <StopIcon className="mr-2 h-4 w-4" />
                    投票を終了
                  </button>
                </>
              )}
              <button
                onClick={openEditModal}
                className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                <ChartBarIcon className="mr-2 h-4 w-4" />
                編集
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">総投票数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalVotes}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">選択肢数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{vote.options?.length}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">あなたの投票数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{userVotes?.length}</p>
        </div>
      </div>

      {/* 投票選択肢 */}
      <div className="space-y-4">
        {sortedOptions.map((option, index) => {
          const percentage = getPercentage(option.vote_count);
          const isVoted = userVotedOptionIds.includes(option.id);

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="relative"
            >
              <div
                className={`rounded-lg border p-4 transition-all ${
                  vote.is_active
                    ? 'cursor-pointer hover:border-blue-500 hover:shadow-sm'
                    : 'cursor-not-allowed opacity-75'
                } ${isVoted ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                onClick={vote.is_active ? () => handleVote(option.id) : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        isVoted ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {isVoted && <CheckIcon className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{option.option_text}</p>
                      {option.work && (
                        <Link
                          href={`/artworks/${option.work.id}`}
                          className="text-sm text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          作品を表示
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {option.vote_count}票 ({percentage}%)
                      </p>
                    </div>
                    {isVoteCreator && vote.is_active && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOption(option.id);
                        }}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
                        title="選択肢を削除"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {/* プログレスバー */}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full ${isVoted ? 'bg-blue-500' : 'bg-gray-400'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 投票できない場合のメッセージ */}
      {!vote.is_active && (
        <div className="mt-8 rounded-lg bg-yellow-50 p-4 text-center">
          <p className="text-yellow-800">この投票は終了しています。</p>
        </div>
      )}

      {/* 複数選択の説明 */}
      {vote.multi_select && vote.is_active && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-blue-800">この投票は複数選択可能です。複数の選択肢に投票できます。</p>
        </div>
      )}

      {/* 危険な操作 */}
      {isVoteCreator && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-sm font-medium text-gray-900">危険な操作</h3>
          <button
            onClick={handleDeleteVote}
            disabled={deleteVoteMutation.isPending}
            className="flex items-center rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            投票を削除
          </button>
        </div>
      )}

      {/* 選択肢追加モーダル */}
      {showAddOptionModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">選択肢を追加</h2>
            <form onSubmit={handleAddOption}>
              <div className="mb-4">
                <label
                  htmlFor="option-text"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  選択肢テキスト <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="option-text"
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="option-work"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  関連作品（任意）
                </label>
                <select
                  id="option-work"
                  value={newOptionWorkId || ''}
                  onChange={(e) =>
                    setNewOptionWorkId(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">作品を選択...</option>
                  {/* TODO: タスクの作品一覧を表示 */}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddOptionModal(false)}
                  className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={addOptionMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {addOptionMutation.isPending ? '追加中...' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 投票編集モーダル */}
      {showEditModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">投票を編集</h2>
            <form onSubmit={handleUpdateVote}>
              <div className="mb-4">
                <label
                  htmlFor="edit-title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  投票タイトル <span className="text-red-500">*</span>
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
              <div className="mb-4">
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
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editMultiSelect}
                    onChange={(e) => setEditMultiSelect(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">複数選択可能にする</span>
                </label>
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
                  disabled={updateVoteMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {updateVoteMutation.isPending ? '更新中...' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
