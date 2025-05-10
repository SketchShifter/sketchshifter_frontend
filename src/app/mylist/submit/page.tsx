'use client';

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useCurrentUser } from '@/hooks/use-auth';
import Script from 'next/script';
import { setupCanvasUtils, compileAndRun } from '@/lib/processing-utils';
import { PlayIcon } from '@heroicons/react/24/outline';
import { useCreateWork } from '@/hooks/use-work-hooks';

export default function SubmitWorkPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useCurrentUser();

  // フックを早期リターンの前に移動
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // 認証チェックを行う
  useEffect(() => {
    // 認証の準備が完了していて、かつ認証されていない場合のみリダイレクト
    if (isAuthReady && !isAuthenticated) {
      // 認証されていない場合、ログインページにリダイレクト
      router.push('/login?redirect=/mylist/submit');
    }
  }, [isAuthenticated, router, isAuthReady]);

  // フォームの状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const codeShared = true; // 常にtrueに設定
  const [codeContent, setCodeContent] = useState('');

  // ファイル関連の状態
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // フォームのリファレンス
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // TanStack Queryを使ったファイルアップロードミューテーション
  const uploadMutation = useCreateWork();

  // ファイル選択ハンドラー
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      // プレビュー用のURL生成
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setFilePreview(fileReader.result as string);
      };
      fileReader.readAsDataURL(selectedFile);

      // PDEファイルの場合はコードを読み込む
      if (selectedFile.name.endsWith('.pde')) {
        const codeReader = new FileReader();
        codeReader.onload = () => {
          setCodeContent(codeReader.result as string);
        };
        codeReader.readAsText(selectedFile);
      }
    } else {
      setFilePreview(null);
    }
  };

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

  // ファイル選択をトリガーする
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // サムネイル選択をトリガーする
  const triggerThumbnailInput = () => {
    thumbnailInputRef.current?.click();
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('ログインが必要です。再度ログインしてください。');
      router.push('/login?redirect=/mylist/submit');
      return;
    }

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    if (!codeContent.trim()) {
      setError('PDEコードを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // FormDataの作成（OpenAPI仕様に合わせて修正）
      const formData = new FormData();

      // 必須フィールド
      formData.append('title', title);
      formData.append('pde_content', codeContent);

      // オプションフィールド
      if (description) formData.append('description', description);
      if (tags) formData.append('tags', tags);
      formData.append('code_shared', codeShared.toString());

      // サムネイル（任意）
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      // TanStack Queryミューテーションを使用してアップロード
      await uploadMutation.mutateAsync(formData);
      setUploadProgress(100);
    } catch (error) {
      console.error('アップロード中にエラーが発生しました:', error);
      setError('アップロードに失敗しました');
      toast.error('アップロードに失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // プレビュー用のステート追加
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [canvasKey, setCanvasKey] = useState<number>(0);
  const [jsCode, setJsCode] = useState<string>('');
  const [showJsCode, setShowJsCode] = useState<boolean>(false);

  // スクリプトの読み込み完了ハンドラー
  const handleScriptLoad = () => {
    console.log('スクリプトが読み込まれました');
    setIsScriptLoaded(true);
    setupCanvasUtils((message) => console.log(message));

    // スクリプトが読み込まれたら、すぐにキャンバスを初期化
    if (window.resetCanvas) window.resetCanvas();
  };

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

  // Processingコードをプレビュー実行
  const executePreview = () => {
    if (!codeContent.trim()) {
      setError('プレビューするコードがありません');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // コンパイルと実行を行う
      compileAndRun(
        codeContent,
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
      setIsSubmitting(false);
    }
  };

  // 認証チェックが完了していない場合はローディング表示
  if (!isAuthReady) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // 認証が完了していても認証されていない場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated) {
    return null;
  }

  // メインの描画
  return (
    <>
      <Script
        src="/scripts/runCode.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={() => setError('スクリプト読み込みエラー')}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">新しい作品を投稿</h1>
          <p className="mt-2 text-gray-600">作品のファイルとメタデータを入力してください。</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
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
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
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

        {uploadMutation.isPending && (
          <div className="mb-6">
            <div className="mb-2 flex justify-between">
              <span className="text-sm font-medium text-gray-700">アップロード中...</span>
              <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ファイルとサムネイルアップロードエリア */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* メインファイルアップロード */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="mb-4 text-lg font-medium">
                作品ファイル <span className="text-red-500">*</span>
              </h2>
              <input
                title="作品ファイルを選択"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pde"
              />

              <div
                onClick={triggerFileInput}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 ${file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
              >
                {file ? (
                  <div className="flex flex-col items-center">
                    <svg
                      className="h-12 w-12 text-indigo-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {file.name}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg
                      className="mb-2 h-10 w-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <p className="mb-1 text-sm font-medium text-gray-900">
                      クリックしてファイルを選択
                    </p>
                    <p className="text-xs text-gray-500">PDE</p>
                    <p className="text-xs text-gray-500">最大 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* サムネイルアップロード */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="mb-4 text-lg font-medium">サムネイル（任意）</h2>
              <input
                title="サムネイルを選択"
                type="file"
                ref={thumbnailInputRef}
                onChange={handleThumbnailChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.webp"
              />

              <div
                onClick={triggerThumbnailInput}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 ${thumbnail ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
              >
                {thumbnail ? (
                  <div className="flex flex-col items-center">
                    {thumbnailPreview && (
                      <img
                        src={thumbnailPreview}
                        alt="サムネイルプレビュー"
                        width={300}
                        height={200}
                        className="max-h-32 max-w-full rounded object-contain"
                      />
                    )}
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {thumbnail.name}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {(thumbnail.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg
                      className="mb-2 h-10 w-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <p className="mb-1 text-sm font-medium text-gray-900">
                      クリックしてサムネイルを選択
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* プレビューエリア */}
          {file && file.name.endsWith('.pde') && (
            <div className="space-y-6 rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">プレビュー</h2>
                <button
                  type="button"
                  onClick={executePreview}
                  disabled={isSubmitting || !isScriptLoaded || !codeContent.trim()}
                  className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  {isSubmitting
                    ? '処理中...'
                    : isScriptLoaded
                      ? 'プレビュー実行'
                      : 'スクリプト読み込み中...'}
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
                      「プレビュー実行」ボタンをクリックして
                      <br />
                      プレビューを表示してください
                    </p>
                  </div>
                )}
              </div>

              {jsCode && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">変換されたJavaScriptコード</h3>
                    <button
                      type="button"
                      onClick={() => setShowJsCode(!showJsCode)}
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      {showJsCode ? 'コードを隠す' : 'コードを表示'}
                    </button>
                  </div>

                  {showJsCode && (
                    <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-white">
                      <code>{jsCode}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 作品情報 */}
          <div className="space-y-6 rounded-lg border border-gray-200 p-6">
            <h2 className="mb-4 text-xl font-medium">作品情報</h2>

            {/* タイトル */}
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="作品のタイトル"
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            {/* 説明 */}
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                説明
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="作品の説明"
                rows={4}
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>

            {/* タグ */}
            <div>
              <label htmlFor="tags" className="mb-1 block text-sm font-medium text-gray-700">
                タグ（カンマ区切り）
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="art, processing, generative"
                className="block w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">複数のタグはカンマ(,)で区切ってください</p>
            </div>

            {/* コード共有オプション (PDEファイルの場合) */}
            {file && file.name.endsWith('.pde') && (
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="codeShared"
                    checked={codeShared}
                    disabled={true} // 常にtrueなので無効化
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="codeShared"
                    className="ml-2 block text-sm font-medium text-gray-700"
                  >
                    コードを公開する（必須）
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  コードは常に公開されます。これによって他のユーザーがあなたのコードを学習できます
                </p>

                {codeShared && (
                  <div className="mt-3">
                    <label
                      htmlFor="codeContent"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      コード内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="codeContent"
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      rows={10}
                      className="block w-full rounded-lg border border-gray-300 p-2.5 font-mono text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    ></textarea>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex items-center justify-between">
            <Link
              href="/mylist"
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:bg-indigo-400"
            >
              {uploadMutation.isPending ? 'アップロード中...' : '作品を投稿する'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
