'use client';

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useCurrentUser } from '@/hooks/use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { workQueryKeys } from '@/hooks/use-work-hooks';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function EditArtworkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { isAuthenticated, isAuthReady } = useCurrentUser();

  // API URLの設定
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.serendicode-sub.click';

  // フォームの状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // フォームの状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [codeShared, setCodeShared] = useState(true);
  const [pdeContent, setPdeContent] = useState('');

  // ファイル関連の状態
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);

  // フォームのリファレンス
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // 認証ストアからトークン取得
  const token = useAuthStore((state) => state.token);

  // 認証チェックを行う
  useEffect(() => {
    // 認証の準備が完了していて、かつ認証されていない場合のみリダイレクト
    if (isAuthReady && (!isAuthenticated || !token)) {
      // 認証されていない場合、ログインページにリダイレクト
      router.push(`/login?redirect=/mylist/edit/${id}`);
    }
  }, [isAuthenticated, token, router, isAuthReady, id]);

  // 作品データを取得
  const { data, isLoading } = useQuery({
    queryKey: workQueryKeys.work(id),
    queryFn: async () => {
      if (!token) throw new Error('認証が必要です');

      const response = await fetch(`${API_BASE_URL}/works/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('作品が見つかりません');
        }
        throw new Error('データの取得に失敗しました');
      }

      return await response.json();
    },
    enabled: !!token && isAuthenticated,
  });

  // データが取得できた時の処理
  useEffect(() => {
    if (data?.work) {
      setTitle(data.work.title || '');
      setDescription(data.work.description || '');
      setCodeShared(data.work.code_shared === undefined ? true : data.work.code_shared);
      setCurrentThumbnailUrl(data.work.thumbnail_url || null);

      // タグがある場合はカンマ区切りの文字列に変換
      if (data.work.tags && Array.isArray(data.work.tags)) {
        setTags(data.work.tags.map((tag: { name: string }) => tag.name).join(','));
      }
    }

    // Processing作品のデータがある場合
    if (data?.processing_work || data?.work?.processing_work) {
      const processingWork = data.processing_work || data.work.processing_work;
      setPdeContent(processingWork.pde_content || '');
    }
  }, [data]);

  // 更新ミューテーション
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!token) {
        throw new Error('認証が必要です。再度ログインしてください。');
      }

      const response = await fetch(`${API_BASE_URL}/works/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // 401エラーの場合は再ログインを促す
        if (response.status === 401) {
          throw new Error('認証の有効期限が切れています。再度ログインしてください。');
        }
        throw new Error(errorData.error || '更新に失敗しました');
      }

      return await response.json();
    },
    onSuccess: () => {
      setSuccess('作品が正常に更新されました！');
      toast.success('作品が正常に更新されました！');

      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: workQueryKeys.work(id) });
      queryClient.invalidateQueries({ queryKey: ['my-works'] });

      // 1.5秒後に詳細ページにリダイレクト
      setTimeout(() => {
        router.push(`/artworks/${id}`);
      }, 1500);
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('サーバー接続エラー');
        toast.error('サーバー接続エラー');
      }
    },
  });

  // 削除ミューテーション
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error('認証が必要です。再度ログインしてください。');
      }

      const response = await fetch(`${API_BASE_URL}/works/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('認証の有効期限が切れています。再度ログインしてください。');
        }
        throw new Error(errorData.error || '削除に失敗しました');
      }

      return true;
    },
    onSuccess: () => {
      toast.success('作品を削除しました');
      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: ['my-works'] });
      // マイリストページに遷移
      router.push('/mylist');
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('サーバー接続エラー');
        toast.error('サーバー接続エラー');
      }
    },
  });

  // サムネイル選択ハンドラー
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setThumbnail(selectedFile);

    if (selectedFile) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setThumbnailPreview(fileReader.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
    } else {
      setThumbnailPreview(null);
    }
  };

  // サムネイル選択をトリガーする
  const triggerThumbnailInput = () => {
    thumbnailInputRef.current?.click();
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      setError('ログインが必要です。再度ログインしてください。');
      router.push(`/login?redirect=/mylist/edit/${id}`);
      return;
    }

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // FormDataの作成
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('pde_content', pdeContent);
      formData.append('code_shared', codeShared.toString());
      formData.append('tags', tags);

      // サムネイルがある場合のみ追加
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      // 更新APIを呼び出し
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error('更新エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 削除確認ダイアログを表示
  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  // 削除処理を実行
  const executeDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      console.error('削除エラー:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">作品を編集</h1>
        <Link
          href="/mylist"
          className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          マイリストに戻る
        </Link>
      </div>

      {(error || success) && (
        <div className="mb-6">
          {error && (
            <div className="mb-2 rounded-lg bg-red-50 p-4 text-red-700">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit}>
          {/* タイトル入力 */}
          <div className="mb-4">
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="作品のタイトルを入力してください"
            />
          </div>

          {/* 説明入力 */}
          <div className="mb-4">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
              説明
            </label>
            <textarea
              id="description"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="作品の説明を入力してください"
            />
          </div>

          {/* PDEコード入力 */}
          <div className="mb-4">
            <label htmlFor="pde_content" className="mb-2 block text-sm font-medium text-gray-700">
              PDEコード
            </label>
            <textarea
              id="pde_content"
              className="w-full rounded-md border border-gray-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
              value={pdeContent}
              onChange={(e) => setPdeContent(e.target.value)}
              rows={8}
              placeholder="Processingのコードを入力してください"
            />
          </div>

          {/* サムネイル選択 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">サムネイル</label>
            <input
              title="サムネイルを選択"
              type="file"
              ref={thumbnailInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />

            <div className="mt-2 flex items-center">
              {thumbnailPreview || currentThumbnailUrl ? (
                <div className="relative h-48 w-48 overflow-hidden rounded-md">
                  <Image
                    src={thumbnailPreview || currentThumbnailUrl || ''}
                    alt="サムネイルプレビュー"
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
                  <span className="text-sm text-gray-500">サムネイルなし</span>
                </div>
              )}

              <button
                type="button"
                onClick={triggerThumbnailInput}
                className="ml-4 cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                {thumbnailPreview || currentThumbnailUrl ? '変更する' : '選択する'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              ※ サムネイルを変更しない場合は、現在のサムネイルがそのまま使用されます
            </p>
          </div>

          {/* コード共有設定 */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={codeShared}
                onChange={(e) => setCodeShared(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">コードを公開する</span>
            </label>
          </div>

          {/* タグ入力 */}
          <div className="mb-6">
            <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gray-700">
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              id="tags"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例: アート, ゲーム, 3D"
            />
            <p className="mt-1 text-xs text-gray-500">※ カンマ区切りで複数のタグを入力できます</p>
          </div>

          {/* ボタンエリア */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={confirmDelete}
              className="flex cursor-pointer items-center rounded-md bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
            >
              <TrashIcon className="mr-2 h-5 w-5" />
              作品を削除
            </button>

            <div className="flex space-x-4">
              <Link
                href={`/artworks/${id}`}
                className="rounded-md bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? '更新中...' : '更新する'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">作品を削除しますか？</h3>
            <p className="mb-6 text-sm text-gray-500">
              この操作は取り消せません。作品データはすべて削除されます。
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={deleteMutation.isPending}
                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-red-300"
              >
                {deleteMutation.isPending ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
