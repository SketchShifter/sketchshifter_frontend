// artworks/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  UserIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  ChevronUpIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { formatDate } from '@/lib/formatDate';
import { setupCanvasUtils, compileAndRun } from '@/lib/processing-utils';
import { useParams, useRouter } from 'next/navigation';
import {
  useWork,
  useComments,
  useLikeStatus,
  useLikeToggle,
  useAddComment,
} from '@/hooks/use-work-hooks';
import { useCurrentUser } from '@/hooks/use-auth';

export default function ArtworkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [canvasKey, setCanvasKey] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [jsCode, setJsCode] = useState<string>('');
  const [showJsCode, setShowJsCode] = useState<boolean>(false);
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [guestNickname, setGuestNickname] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.serendicode-sub.click';

  // 認証状態と現在のユーザー情報を取得
  const { isAuthenticated } = useCurrentUser();

  // データ取得のためのクエリ
  const { data: workData, isLoading, isError } = useWork(id);
  const { data: comments = [] } = useComments(id);
  const { data: likeStatus } = useLikeStatus(id);
  const likeMutation = useLikeToggle();
  const commentMutation = useAddComment();

  const work = workData?.work;
  const processingWork = workData?.work;
  const liked = likeStatus?.liked || false;

  // スクリプトの読み込み完了ハンドラー
  const handleScriptLoad = () => {
    console.log('スクリプトが読み込まれました');
    setIsScriptLoaded(true);
    setupCanvasUtils((message) => console.log(message));

    // スクリプトが読み込まれたら、すぐにキャンバスを初期化
    if (window.resetCanvas) window.resetCanvas();
  };

  // スクロールイベントを監視
  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // クリーンアップとスクリプト初期化
  useEffect(() => {
    // エラー処理用
    const handleProcessingError = (event: ErrorEvent) => {
      console.error('Processing error caught:', event.error);
      setError(`Processing実行エラー: ${event.error}`);
    };

    window.addEventListener('error', handleProcessingError);

    // スクリプトがすでに読み込まれている場合（例：ホットリロード時）
    if (window.resetCanvas && !isScriptLoaded) {
      setIsScriptLoaded(true);
      setupCanvasUtils((message) => console.log(message));
      window.resetCanvas();
    }

    return () => {
      // アニメーションループを停止
      if (window.animationFrameId !== undefined) cancelAnimationFrame(window.animationFrameId);
      window.removeEventListener('error', handleProcessingError);
    };
  }, [isScriptLoaded]);

  // いいねの切り替え
  const toggleLike = async () => {
    // 認証状態をチェック - TanStack Queryと連携して確実に判定
    if (!isAuthenticated) {
      toast.error('ログインが必要です。');
      // ログインページへリダイレクト
      router.push('/login?redirect=' + encodeURIComponent(`/artworks/${id}`));
      return;
    }

    try {
      await likeMutation.mutateAsync({ workId: id, liked });
      toast.success(liked ? 'いいねを取り消しました' : 'いいねを押しました！');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('サーバーに接続できませんでした。');
      }
    }
  };

  // Processingコードを実行
  const executeProcessingCode = () => {
    if (!processingWork || !processingWork.pde_content) {
      setError('PDEコードがありません');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // コンパイルと実行を行う
      compileAndRun(
        processingWork.pde_content,
        isScriptLoaded,
        (message) => {
          console.log(message);
          // エラーが含まれているかチェック
          if (message.includes('エラー')) setError(message);
        },
        setJsCode,
        () => {}, // デバッグ表示は不要なので空の関数
        setCanvasKey
      );

      setSuccess('プレビューを実行しました');
      setIsPreviewActive(true);
    } catch (error) {
      console.error('プレビュー実行エラー:', error);
      if (error instanceof Error) {
        setError(`エラーが発生しました: ${error.message}`);
      } else {
        setError('予期せぬエラーが発生しました');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // コメント投稿処理
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error('コメントを入力してください');
      return;
    }

    try {
      // ゲストとしてコメントするか認証ユーザーとしてコメントするかを判断
      const commentData = isAuthenticated
        ? { content: commentText }
        : {
            content: commentText,
            is_guest: true,
            guest_nickname: guestNickname.trim() || 'ゲスト',
          };

      await commentMutation.mutateAsync({
        workId: id,
        commentData,
      });

      // フォームをリセット
      setCommentText('');
      setGuestNickname('');

      toast.success('コメントを投稿しました');
    } catch (error) {
      console.error('コメント投稿エラー:', error);
      if (error instanceof Error) {
        toast.error(`エラー: ${error.message}`);
      } else {
        toast.error('コメントの投稿に失敗しました');
      }
    }
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

  if (isError || !work) {
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
    <>
      <Script
        src="/scripts/runCode.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={() => setError('スクリプト読み込みエラー')}
      />

      <div className="mx-auto px-4 py-8">
        {/* 作品ヘッダー: タイトル、作者、統計情報 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">{work.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {work.user && (
              <Link
                href={`/users/${work.user.id}`}
                className="flex items-center text-blue-600 hover:underline"
              >
                <UserIcon className="mr-1 h-4 w-4" />
                {work.user.nickname}
              </Link>
            )}

            <span className="flex items-center">
              <ClockIcon className="mr-1 h-4 w-4" />
              {formatDate(work.created_at)}
            </span>

            <span className="flex items-center">
              <EyeIcon className="mr-1 h-4 w-4" />
              {work.views}閲覧
            </span>

            <button
              onClick={toggleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                likeMutation.isPending
                  ? 'cursor-wait bg-gray-200 text-gray-500'
                  : liked
                    ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {liked ? (
                <HeartIconSolid className="mr-2 h-5 w-5 text-pink-500" />
              ) : (
                <HeartIcon className="mr-2 h-5 w-5" />
              )}
              {likeMutation.isPending ? '処理中...' : liked ? 'いいね済み' : 'いいね'}
            </button>

            <Link href="#comments" className="flex items-center hover:text-blue-600">
              <ChatBubbleLeftIcon className="mr-1 h-4 w-4" />
              {work.comments_count}
            </Link>
          </div>

          {/* タグ */}
          {work.tags && work.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
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
          )}

          {/* 説明 */}
          {work.description && (
            <div className="mt-4 border-t border-gray-100 pt-4 text-gray-700">
              <h2 className="mb-2 text-lg font-medium text-gray-900">説明</h2>
              <div className="whitespace-pre-wrap">{work.description}</div>
            </div>
          )}
        </div>

        {/* 通知エリア（エラーと成功メッセージ） */}
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

        {/* 実行ボタンエリア */}
        {processingWork && processingWork.pde_content && (
          <div className="mb-6 flex justify-between rounded-lg bg-white p-4 shadow-sm">
            <button
              onClick={executeProcessingCode}
              disabled={isProcessing || !isScriptLoaded}
              className="flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:bg-blue-300"
            >
              <PlayIcon className="h-5 w-5 md:mr-2" />
              <span>
                {isProcessing
                  ? '処理中...'
                  : isScriptLoaded
                    ? 'スケッチを実行'
                    : 'スクリプト読み込み中...'}
              </span>
            </button>

            <div className="flex space-x-2">
              <a
                href={`${API_BASE_URL}/works/${work.id}/file`}
                download={work.title}
                className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                title="ダウンロード"
              >
                <ArrowDownTrayIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">ダウンロード</span>
              </a>

              <button
                onClick={toggleLike}
                disabled={likeMutation.isPending}
                className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  likeMutation.isPending
                    ? 'cursor-wait bg-gray-200 text-gray-500'
                    : liked
                      ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={liked ? 'いいねを取り消す' : 'いいね'}
              >
                {liked ? (
                  <HeartIconSolid className="h-5 w-5 text-pink-500 md:mr-2" />
                ) : (
                  <HeartIcon className="h-5 w-5 md:mr-2" />
                )}
                <span className="hidden md:inline">
                  {likeMutation.isPending ? '処理中...' : liked ? 'いいね済み' : 'いいね'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* プレビューエリア */}
        <div
          className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}
        >
          {/* 左側: プレビューエリア */}
          <div className={isFullscreen ? 'w-full' : 'lg:col-span-7'}>
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">プレビュー</h2>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {isFullscreen ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 4a1 1 0 00-1 1v4a1 1 0 01-2 0V5a3 3 0 013-3h4a1 1 0 010 2H5zm10 0a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zm-1 10a1 1 0 011 1v4a3 3 0 01-3 3h-4a1 1 0 110-2h4a1 1 0 011-1v-4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      全画面解除
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      全画面表示
                    </>
                  )}
                </button>
              </div>
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-inner transition-all">
                {isPreviewActive ? (
                  <canvas
                    id="canvas"
                    key={canvasKey}
                    width="600"
                    height="400"
                    className="border border-gray-300"
                  ></canvas>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-gray-500">
                    <PlayIcon className="mb-2 h-12 w-12" />
                    <p className="text-lg">
                      「スケッチを実行」ボタンをクリックして
                      <br />
                      プレビューを表示してください
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                <p className="font-medium">使い方:</p>
                <ol className="mt-2 ml-5 list-decimal">
                  <li>上部の「スケッチを実行」ボタンをクリックしてプレビューを表示</li>
                  <li>プレビューが表示されない場合は、コードを確認してください</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 右側: ソースコードエリア */}
          <div className={isFullscreen ? 'w-full' : 'lg:col-span-5'}>
            {/* PDEコード表示 */}
            {work && work.pde_content && work.code_shared && (
              <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center text-lg font-medium text-gray-900">
                    <CodeBracketIcon className="mr-2 h-5 w-5 text-blue-500" />
                    PDEソースコード
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsCodeVisible(!isCodeVisible)}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {isCodeVisible ? 'コードを隠す' : 'コードを表示'}
                  </button>
                </div>

                {isCodeVisible && (
                  <div className="relative">
                    <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                      <code>{work.pde_content}</code>
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(work.pde_content)}
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
                  </div>
                )}
              </div>
            )}

            {/* 変換されたJSコード（表示/非表示切り替え可能） */}
            {jsCode ? (
              <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center text-lg font-medium text-gray-900">
                    <CodeBracketIcon className="mr-2 h-5 w-5 text-yellow-500" />
                    変換されたJavaScriptコード
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowJsCode(!showJsCode)}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {showJsCode ? 'コードを隠す' : 'コードを表示'}
                  </button>
                </div>

                {showJsCode && (
                  <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-white">
                    <code>{jsCode}</code>
                  </pre>
                )}
              </div>
            ) : (
              <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <p className="text-center text-gray-500">スケッチを実行してください</p>
              </div>
            )}
          </div>
        </div>

        {/* コメントセクション */}
        <div id="comments" className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-medium text-gray-900">
            コメント ({work.comments_count})
          </h2>

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.slice(0, 3).map((comment) => (
                <div
                  key={comment.id}
                  className="rounded border-l-4 border-l-blue-400 bg-gray-50 p-4"
                >
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
                <div className="pt-2 text-center">
                  <Link
                    href={`/works/${work.id}/comments`}
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    すべてのコメントを表示
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <p className="py-6 text-center text-gray-500">まだコメントはありません</p>
          )}

          {/* コメント投稿フォーム */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-4 font-medium text-gray-900">コメントを投稿</h3>
            <form onSubmit={handleCommentSubmit}>
              <div className="mb-4">
                <textarea
                  className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="コメントを入力してください"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
              </div>

              {!isAuthenticated && (
                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                    placeholder="ニックネーム（任意）"
                    value={guestNickname}
                    onChange={(e) => setGuestNickname(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    ※ログインしていない場合は、ゲストとして投稿されます
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={commentMutation.isPending || !commentText.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {commentMutation.isPending ? '送信中...' : '投稿する'}
              </button>
            </form>
          </div>
        </div>

        {/* ページの一番上に戻るボタン */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="fixed right-6 bottom-6 rounded-full bg-blue-500 p-3 text-white shadow-lg transition hover:bg-blue-600 focus:outline-none"
            aria-label="ページの一番上に戻る"
          >
            <ChevronUpIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </>
  );
}
