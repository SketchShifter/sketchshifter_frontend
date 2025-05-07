'use client';

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
export default function SubmitWorkPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // フォームの状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [codeShared, setCodeShared] = useState(false);
  const [codeContent, setCodeContent] = useState('');

  // ファイル関連の状態
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // フォームのリファレンス
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string | null>(null);

  // API URLの設定
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.serendicode-sub.click';

  // コンポーネントのマウント時に認証チェック
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    if (!storedToken) {
      router.push('/login');
    }
  }, []);

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

  // Cloudinaryに直接アップロードする関数
  const uploadToCloudinary = async (
    file: File,
    isImage: boolean = true,
    quality: number = 75
  ): Promise<{ public_id: string; secure_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'sketchshifter');
    formData.append('resource_type', isImage ? 'image' : 'raw');
    formData.append('quality', quality.toString());

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('アップロードに失敗しました');
    }

    const data = await response.json();
    console.log(`${file.name} のアップロード結果:`, data);
    return data;
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('ログインが必要です');
      return;
    }

    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Step 1: ファイルをCloudinaryにアップロード
      setUploadProgress(10);

      // PDEファイルの場合は別の処理を行う
      const isPDE = file.name.endsWith('.pde');

      // アップロード結果を保持する変数
      let fileData = null;
      let thumbnailData = null;

      // ファイルのアップロード（PDEファイル以外）
      if (!isPDE) {
        // PDEファイル以外は画像としてCloudinaryにアップロード
        fileData = await uploadToCloudinary(file, true, 75);
        setUploadProgress(50);
      }

      // サムネイルがある場合はCloudinaryにアップロード
      if (thumbnail) {
        thumbnailData = await uploadToCloudinary(thumbnail, true, 70);
        setUploadProgress(70);
      }

      // Step 2: バックエンドAPIに作品情報を送信
      setUploadProgress(80);

      // FormDataの作成
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('code_shared', codeShared.toString());
      formData.append('code_content', codeContent);
      formData.append('tags', tags);

      // PDEファイルの場合は直接アップロード
      if (isPDE) {
        formData.append('file', file);
      } else if (fileData) {
        // CloudinaryのURLとIDを送信
        formData.append('file_url', fileData.secure_url);
        formData.append('file_public_id', fileData.public_id);
        formData.append('file_type', file.type);
        formData.append('file_name', file.name);
      }

      // サムネイル情報
      if (thumbnailData) {
        formData.append('thumbnail_url', thumbnailData.secure_url);
        formData.append('thumbnail_public_id', thumbnailData.public_id);
        formData.append('thumbnail_type', thumbnail?.type || '');

        // デバッグ用ログ
        console.log('サムネイル情報をフォームに追加:', {
          url: thumbnailData.secure_url,
          public_id: thumbnailData.public_id,
          type: thumbnail?.type,
        });
      }

      // APIリクエスト
      const response = await fetch(`${API_BASE_URL}/works`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(100);
      const data = await response.json();

      if (response.ok) {
        setSuccess('作品が正常にアップロードされました！');
        toast.success('作品が正常にアップロードされました！');
        // 成功した場合、詳細ページにリダイレクト
        setTimeout(() => {
          router.push(`/artworks/${data.work.id}`);
        }, 1500);
      } else {
        setError(data.error || 'アップロードに失敗しました');
        toast.error('アップロードに失敗しました');
      }
    } catch (error) {
      console.error('アップロード中にエラーが発生しました:', error);
      setError('サーバー接続エラー');
      toast.error('サーバー接続エラー');
    } finally {
      setIsSubmitting(false);
    }
  };

  // メインの描画
  return (
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

      {isSubmitting && (
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
                  {filePreview && !file.name.endsWith('.pde') ? (
                    <Image
                      src={filePreview}
                      alt="プレビュー"
                      width={300}
                      height={200}
                      className="max-h-32 max-w-full rounded object-contain"
                    />
                  ) : (
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
                  )}
                  <span className="mt-2 block text-sm font-medium text-gray-900">{file.name}</span>
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
                    <Image
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
                  onChange={(e) => setCodeShared(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="codeShared"
                  className="ml-2 block text-sm font-medium text-gray-700"
                >
                  コードを公開する
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                チェックを入れると、他のユーザーがあなたのコードを閲覧できるようになります
              </p>

              {codeShared && (
                <div className="mt-3">
                  <label
                    htmlFor="codeContent"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    コード内容
                  </label>
                  <textarea
                    id="codeContent"
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    rows={10}
                    className="block w-full rounded-lg border border-gray-300 p-2.5 font-mono text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:bg-indigo-400"
          >
            {isSubmitting ? 'アップロード中...' : '作品を投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}
