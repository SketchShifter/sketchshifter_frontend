'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  UserIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { setupProcessingEnvironment } from '../../../../public/processingEmulator';
import { formatDate } from '@/lib/formatDate';
import { useParams } from 'next/navigation';
// 型定義
interface ProcessingWork {
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

interface User {
  id: number;
  name: string;
  nickname: string;
}

interface Work {
  id: number;
  title: string;
  description: string;
  file_type: string;
  file_url: string;
  thumbnail_url: string | null;
  code_shared: boolean;
  code_content: string;
  views: number;
  created_at: string;
  user: User | null;
  tags: { id: number; name: string }[];
  likes_count: number;
  comments_count: number;
  processing_work?: ProcessingWork;
}

interface Comment {
  id: number;
  content: string;
  user: User | null;
  guest_nickname: string | null;
  is_guest: boolean;
  created_at: string;
}

export default function ArtworkDetailPage() {
  const params = useParams();
  const id = params.id;
  const [work, setWork] = useState<Work | null>(null);
  const [processingWork, setProcessingWork] = useState<ProcessingWork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Canvas描画用
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // API URLの設定
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.serendicode-sub.click';

  // 作品データの取得
  useEffect(() => {
    const fetchWork = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let token = null;
        try {
          token = localStorage.getItem('token');
        } catch (e) {
          console.log('no token', e);
        }

        const response = await fetch(`${API_BASE_URL}/works/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error('作品データの取得に失敗しました');
        }

        const data = await response.json();
        console.log('取得した作品データ:', data);

        // APIから返された作品データを設定
        setWork(data.work || data);

        // APIから返されたProcessing作品データを設定
        if (data.processing_work) {
          setProcessingWork(data.processing_work);
        } else if (data.work && data.work.processing_work) {
          setProcessingWork(data.work.processing_work);
        }

        // ユーザーがログインしている場合、いいね状態を確認
        if (token) {
          checkLikeStatus(data.work?.id || data.id);
        }

        // コメント取得
        fetchComments(data.work?.id || data.id);
      } catch (error) {
        console.error('エラー:', error);
        setError('作品データの取得中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchWork();
    }
  }, [id, API_BASE_URL]);

  // Canvas描画を実行するuseEffect
  useEffect(() => {
    let cleanup = () => {};

    if (processingWork?.status === 'processed' && canvasRef.current) {
      console.log('Processingでの描画を開始します');

      // デフォルトサイズの設定
      if (canvasRef.current) {
        canvasRef.current.width = 400;
        canvasRef.current.height = 400;
      }

      // JSコンテンツがあれば実行
      console.log('processingWork.js_content:', processingWork.js_content);
      if (processingWork.js_content) {
        // コードを修正して不正な変数宣言を修正
        const fixedJsContent = processingWork.js_content
          .replace(/let\s+([a-zA-Z0-9_]+)\s*=\s*;/g, 'let $1;')
          .replace(/var\s+([a-zA-Z0-9_]+)\s*=\s*;/g, 'var $1;')
          .replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*;/g, 'const $1;');

        // 修正したコードを出力（デバッグ用）
        console.log('修正後のコード:', fixedJsContent);

        cleanup = setupProcessingEnvironment(canvasRef.current, fixedJsContent);
      } else {
        // JSコンテンツがなければエラーメッセージを表示
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 400, 400);
          ctx.fillStyle = 'red';
          ctx.font = '14px sans-serif';
          ctx.fillText('JavaScriptコードがありません', 10, 30);
        }
      }
    }

    // クリーンアップ関数
    return () => {
      cleanup();
    };
  }, [processingWork]);

  // スクロールイベントを監視
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // いいね状態の確認
  const checkLikeStatus = async (workId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/works/${workId}/liked`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('いいね状態の確認:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('いいね状態の確認:', data.liked);
        setLiked(data.liked);
      }
      console.log('いいね状態の確認:', liked);
    } catch (error) {
      console.error('いいね状態の確認中にエラー:', error);
    }
  };

  // コメントの取得
  const fetchComments = async (workId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/works/${workId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('コメントの取得中にエラー:', error);
    }
  };

  // いいねの切り替え
  const toggleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('ログインが必要です。');
        return;
      }

      const url = `${API_BASE_URL}/works/${work?.id}/${liked ? 'unlike' : 'like'}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(!liked);
        // 作品データを更新（いいね数を反映）
        setWork((prev) => (prev ? { ...prev, likes_count: data.likes_count } : null));
        toast.success(liked ? 'いいねを取り消しました' : 'いいねを押しました！');
      } else {
        const errorData = await response.json();
        toast.error(`エラー: ${errorData.message || 'いいね処理に失敗しました。'}`);
      }
    } catch (error) {
      console.error('いいね処理中にエラー:', error);
      toast.error('サーバーに接続できませんでした。');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">
          <h2 className="mb-4 text-xl font-bold">エラーが発生しました</h2>
          <p>{error || '作品が見つかりません'}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 作品タイトルと基本情報 */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{work.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center">
            <ClockIcon className="mr-1 h-4 w-4" />
            {formatDate(work.created_at)}
          </span>

          <span className="flex items-center">
            <EyeIcon className="mr-1 h-4 w-4" />
            {work.views}
          </span>

          <span className="flex items-center">
            {liked ? (
              <HeartIconSolid className="mr-1 h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="mr-1 h-4 w-4" />
            )}
            {work.likes_count}
          </span>

          <span className="flex items-center">
            <ChatBubbleLeftIcon className="mr-1 h-4 w-4" />
            {work.comments_count}
          </span>

          {work.user && (
            <Link
              href={`/users/${work.user.id}`}
              className="flex items-center text-blue-600 hover:underline"
            >
              <UserIcon className="mr-1 h-4 w-4" />
              {work.user.nickname}
            </Link>
          )}
        </div>
      </div>

      {/* 作品の表示エリア */}
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-5">
        {/* 左側：作品表示 */}
        <div className="md:col-span-3">
          <div className="rounded-lg bg-gray-50 p-4 shadow-sm">
            {/* Processing作品の場合 */}
            {processingWork && (
              <div className="flex aspect-square w-full items-center justify-center rounded bg-white p-2">
                {processingWork.status === 'processed' ? (
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-200"
                    width="400"
                    height="400"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="mb-2 animate-spin text-4xl">⚙️</div>
                    <p>
                      {processingWork.status === 'error'
                        ? `エラーが発生しました: ${processingWork.error_message}`
                        : '処理中...'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 画像作品の場合 */}
            {!processingWork && work.file_type?.startsWith('image/') && (
              <div className="relative aspect-square w-full">
                <Image
                  src={work.file_url || work.thumbnail_url || `/api/works/${work.id}/file`}
                  alt={work.title}
                  fill
                  className="rounded object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>

        {/* 右側：情報表示 */}
        <div className="md:col-span-2">
          {/* 説明文 */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">説明</h2>
            <div className="whitespace-pre-wrap text-gray-700">
              {work.description || '説明なし'}
            </div>
          </div>

          {/* タグ */}
          {work.tags && work.tags.length > 0 && (
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-gray-900">タグ</h2>
              <div className="flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/?tag=${tag.name}`}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* アクション */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={toggleLike}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition ${
                liked
                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {liked ? (
                <HeartIconSolid className="mr-2 h-5 w-5" />
              ) : (
                <HeartIcon className="mr-2 h-5 w-5" />
              )}
              {liked ? 'いいね済み' : 'いいね'}
            </button>

            <a
              href={`${API_BASE_URL}/works/${work.id}/file`}
              download={work.title}
              className="flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
              ダウンロード
            </a>
          </div>

          {/* Processing作品のPDEコード */}
          {processingWork && processingWork.pde_content && (
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-gray-900">PDEソースコード</h2>
              <div className="relative">
                <button
                  onClick={() => setIsCodeVisible(!isCodeVisible)}
                  className="mb-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  {isCodeVisible ? 'コードを隠す' : 'コードを表示'}
                </button>
                {isCodeVisible && (
                  <pre className="max-h-96 overflow-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
                    <code>{processingWork.pde_content}</code>
                  </pre>
                )}
                {isCodeVisible && (
                  <button
                    onClick={() => navigator.clipboard.writeText(processingWork.pde_content)}
                    className="absolute top-2 right-2 rounded bg-gray-700 p-2 text-white hover:bg-gray-600"
                    title="コピー"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* コードが共有されている場合に表示 */}
          {work.code_shared && work.code_content && !processingWork && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-gray-900">ソースコード</h2>
              <div className="relative">
                <button
                  onClick={() => setIsCodeVisible(!isCodeVisible)}
                  className="mb-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  {isCodeVisible ? 'コードを隠す' : 'コードを表示'}
                </button>
                {isCodeVisible && (
                  <pre className="max-h-96 overflow-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
                    <code>{work.code_content}</code>
                  </pre>
                )}
                {isCodeVisible && (
                  <button
                    onClick={() => navigator.clipboard.writeText(work.code_content)}
                    className="absolute top-2 right-2 rounded bg-gray-700 p-2 text-white hover:bg-gray-600"
                    title="コピー"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* コメントセクション */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-medium text-gray-900">コメント ({work.comments_count})</h2>

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.slice(0, 3).map((comment) => (
              <div key={comment.id} className="rounded border border-gray-100 bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-medium">
                    {comment.user ? comment.user.nickname : comment.guest_nickname || 'ゲスト'}
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(comment.created_at)}</div>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}

            {comments.length > 3 && (
              <div className="text-center">
                <Link
                  href={`/works/${work.id}/comments`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  すべてのコメントを表示
                </Link>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">まだコメントはありません</p>
        )}

        <div className="mt-6">
          <Link
            href={`/works/${work.id}/comments/new`}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            コメントを追加
          </Link>
        </div>
      </div>

      {/* ページの一番上に戻るボタン */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bottom-4 rounded-full bg-blue-500 p-3 text-white shadow-lg transition hover:bg-blue-600"
          aria-label="ページの一番上に戻る"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
