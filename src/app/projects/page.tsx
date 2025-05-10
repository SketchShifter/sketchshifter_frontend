'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  UserGroupIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useMyProjects, useCreateProject, useJoinProject } from '@/hooks/use-project-hooks';
import { useCurrentUser } from '@/hooks/use-auth';
import { formatDate } from '@/lib/formatDate';
import { motion } from 'framer-motion';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  const { isAuthenticated, isAuthReady, user: currentUser } = useCurrentUser();
  const { data: myProjects, isLoading: myProjectsLoading } = useMyProjects();
  const createMutation = useCreateProject();
  const joinMutation = useJoinProject();

  // 検索フィルタリング
  const filteredProjects =
    myProjects?.projects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false
    ) || [];

  // プロジェクト作成ハンドラー
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    await createMutation.mutateAsync({
      title: createTitle,
      description: createDescription,
    });

    setCreateTitle('');
    setCreateDescription('');
    setShowCreateModal(false);
  };

  // プロジェクト参加ハンドラー
  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationCode.trim()) return;

    await joinMutation.mutateAsync({
      invitation_code: invitationCode,
    });

    setInvitationCode('');
    setShowJoinModal(false);
  };

  if (!isAuthReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <h2 className="mb-4 text-xl font-bold text-yellow-900">ログインが必要です</h2>
          <p className="text-yellow-700">プロジェクト機能を利用するにはログインしてください。</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            ログインする
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">プロジェクト</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex cursor-pointer items-center rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              参加する
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              新規作成
            </button>
          </div>
        </div>

        {/* 検索バー */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="プロジェクトを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* タブ */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my')}
            className={`cursor-pointer border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            参加中のプロジェクト
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`cursor-pointer border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            全てのプロジェクト
          </button>
        </nav>
      </div>

      {/* プロジェクト一覧 */}
      {myProjectsLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <FolderIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-xl font-medium text-gray-900">プロジェクトがありません</h2>
          <p className="mb-4 text-gray-600">
            新しいプロジェクトを作成するか、既存のプロジェクトに参加してください。
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              プロジェクトを作成
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              プロジェクトに参加
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/projects/${project.id}`} className="block">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-lg font-medium text-gray-900">{project.title}</h3>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {project.description || '説明はありません'}
                      </p>
                    </div>
                    <FolderIcon className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <UserGroupIcon className="mr-1 h-4 w-4" />
                      {/* TODO: 実際のメンバー数取得の実装 */}
                      メンバー -名
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {formatDate(project.created_at)}
                    </div>
                  </div>

                  {/* オーナーバッジ */}
                  {project.owner_id === parseInt(currentUser?.id || '0') && (
                    <div className="mt-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        オーナー
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* プロジェクト作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">新規プロジェクト作成</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                  プロジェクト名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  説明（任意）
                </label>
                <textarea
                  id="description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {createMutation.isPending ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* プロジェクト参加モーダル */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">プロジェクトに参加</h2>
              <button
                title="閉じる"
                onClick={() => setShowJoinModal(false)}
                className="cursor-pointer p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-blue-800">📩 招待コードの取得方法</h3>
              <p className="text-sm text-blue-700">
                プロジェクトオーナーから招待コードを受け取ってください。オーナーはプロジェクト詳細画面の「招待する」ボタンからコードを確認できます。
              </p>
            </div>

            <form onSubmit={handleJoinProject}>
              <div className="mb-6">
                <label
                  htmlFor="invitation"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  招待コード <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="invitation"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="例: ABC-123-DEF-456"
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={joinMutation.isPending}
                  className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {joinMutation.isPending ? '参加中...' : '参加する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
