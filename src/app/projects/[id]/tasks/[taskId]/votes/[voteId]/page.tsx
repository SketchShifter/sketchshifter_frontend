'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  CheckIcon,
  ChartBarIcon,
  StopIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  useVote,
  useUserVotes,
  useCastVote,
  useRemoveVote,
  useCloseVote,
  useUpdateVote,
  useTaskWorks,
  useProject,
  useTask,
  useAddVoteOption,
} from '@/hooks/use-project-hooks';
import { useCurrentUser } from '@/hooks/use-auth';
import { formatDate } from '@/lib/formatDate';
import { motion } from 'framer-motion';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from 'react-hot-toast';

export default function VoteDetailPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const taskId = parseInt(params.taskId as string);
  const voteId = parseInt(params.voteId as string);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMultiSelect, setEditMultiSelect] = useState(false);

  const { user: currentUser } = useCurrentUser();
  const { data: voteData, isLoading, refetch: refetchVote } = useVote(voteId);
  const { data: userVotesData } = useUserVotes(voteId);
  const { data: worksData } = useTaskWorks(taskId, 1, 100);
  const { data: projectData } = useProject(projectId);
  const { data: taskData } = useTask(taskId);
  const castVoteMutation = useCastVote(voteId);
  const removeVoteMutation = useRemoveVote(voteId);
  const closeVoteMutation = useCloseVote(voteId);
  const updateVoteMutation = useUpdateVote(voteId);
  const addVoteOptionMutation = useAddVoteOption(voteId);

  const works = worksData?.works || [];

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
  const totalVotes = vote.options
    ? vote.options.reduce((sum, option) => sum + option.vote_count, 0)
    : 0;
  const isVoteCreator = currentUser?.id === vote?.creator?.id?.toString();

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

  // 投票終了ハンドラー
  const handleCloseVote = async () => {
    try {
      await closeVoteMutation.mutateAsync();
      await refetchVote();
      setShowConfirmModal(false);
    } catch (error) {
      console.error('投票終了処理中にエラーが発生しました:', error);
    }
  };

  // パーセント計算
  const getPercentage = (count: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  // 作品一覧にオプション情報を追加して投票順にソート
  const worksWithVotes = works
    .map((work) => {
      const option = vote.options?.find((opt) => opt.work_id === work.id);
      return {
        work,
        option,
        isVoted: option ? userVotedOptionIds.includes(option.id) : false,
        voteCount: option ? option.vote_count : 0,
        percentage: option ? getPercentage(option.vote_count) : 0,
        rank: 0,
      };
    })
    .sort((a, b) => b.voteCount - a.voteCount);

  // 同じ投票数の作品には同じ順位を割り当て
  let currentRank = 1;
  let prevVoteCount = -1;
  worksWithVotes.forEach((workData, index) => {
    if (index > 0 && workData.voteCount !== prevVoteCount) {
      currentRank = index + 1;
    }
    workData.rank = currentRank;
    prevVoteCount = workData.voteCount;
  });

  // 作品を一括で選択肢として追加するハンドラー
  const handleAddAllWorksAsOptions = async () => {
    if (!works.length) return;

    try {
      // 既存の選択肢のwork_idを取得
      const existingWorkIds =
        vote.options?.filter((opt) => opt.work_id !== null).map((opt) => opt.work_id) || [];

      // まだ選択肢として追加されていない作品のみを追加
      const worksToAdd = works.filter((work) => !existingWorkIds.includes(work.id));

      // 各作品を選択肢として追加
      for (const work of worksToAdd) {
        await addVoteOptionMutation.mutateAsync({
          option_text: work.title,
          work_id: work.id,
        });
      }

      toast.success(`${worksToAdd.length}件の作品を選択肢として追加しました`);
      await refetchVote();
    } catch (error) {
      console.error('選択肢の追加中にエラーが発生しました:', error);
      toast.error('選択肢の追加に失敗しました');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずナビ */}
      <nav className="mb-8 flex text-sm text-gray-500">
        <Link href="/projects" className="hover:text-gray-700">
          プロジェクト
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${projectId}`} className="hover:text-gray-700">
          {projectData?.project?.title || 'プロジェクト'}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${projectId}/tasks/${taskId}`} className="hover:text-gray-700">
          {taskData?.task?.title || 'タスク'}
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

          {isVoteCreator && vote.is_active && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddAllWorksAsOptions}
                className="flex cursor-pointer items-center rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                作品を一括追加
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={closeVoteMutation.isPending}
                className="flex cursor-pointer items-center rounded-md bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
              >
                <StopIcon className="mr-2 h-4 w-4" />
                投票を終了
              </button>
              <button
                onClick={openEditModal}
                className="flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
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

      {/* 順位表示 */}
      {!vote.is_active && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">投票結果</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    順位
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    作品
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    得票数
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    割合
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {worksWithVotes.map((workData, index) => (
                  <tr
                    key={workData.work.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold">{workData.rank}位</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {workData.work.thumbnail_url ? (
                            <Image
                              src={workData.work.thumbnail_url}
                              alt={workData.work.title}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/artworks/${workData.work.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {workData.work.title}
                          </Link>
                          <div className="text-sm text-gray-500">{workData.work.user.nickname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{workData.voteCount}票</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{workData.percentage}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 作品カードグリッド - すべての選択肢を表示 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {worksWithVotes.map((workData, index) => {
          return (
            <motion.div
              key={workData.work.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <div
                className={`h-full overflow-hidden rounded-lg border shadow transition-all ${
                  vote.is_active && workData.option
                    ? 'cursor-pointer hover:border-blue-500 hover:shadow-md'
                    : 'cursor-default'
                } ${workData.isVoted ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                onClick={
                  vote.is_active && workData.option
                    ? () => handleVote(workData.option?.id || 0)
                    : undefined
                }
              >
                <div className="relative h-40 w-full bg-gray-100">
                  {workData.work.thumbnail_url ? (
                    <Image
                      src={workData.work.thumbnail_url}
                      alt={workData.work.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-gray-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-12 w-12 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                    </div>
                  )}

                  {workData.isVoted && (
                    <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <CheckIcon className="h-5 w-5 text-white" />
                    </div>
                  )}

                  <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-lg font-bold text-white">{workData.percentage}%</span>
                  </div>

                  {!vote.is_active && (
                    <div className="absolute top-2 left-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-yellow-500 px-2">
                      <span className="text-sm font-bold text-white">{workData.rank}位</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="line-clamp-1 font-medium text-gray-900">
                      {workData.work.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{workData.voteCount}票</span>
                    <Link
                      href={`/artworks/${workData.work.id}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      作品を表示
                    </Link>
                  </div>
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

      {/* 投票編集モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
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

      {/* 投票終了確認モーダル */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleCloseVote}
        title="投票を終了しますか？"
        description="この投票を終了すると、新たな投票ができなくなります。この操作は取り消せません。"
        confirmText="投票を終了"
        isPending={closeVoteMutation.isPending}
      />
    </div>
  );
}
