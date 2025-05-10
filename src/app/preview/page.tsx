'use client';

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import Script from 'next/script';
import { setupCanvasUtils, previewProcessingCode } from '@/lib/processing-utils';

// ファイルアップロード用の型定義
interface FileInputEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    files: FileList;
  };
}

export default function PreviewPage() {
  const [pdeCode, setPdeCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showOriginalCode, setShowOriginalCode] = useState<boolean>(true);
  const [showConvertedCode, setShowConvertedCode] = useState<boolean>(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [canvasKey, setCanvasKey] = useState<number>(0);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // エラー処理用
    const handleProcessingError = (event: ErrorEvent) => {
      console.error('Processing error caught:', event.error);
      setError(`Processing実行エラー: ${event.error}`);
    };

    // イベントリスナーを登録
    window.addEventListener('error', handleProcessingError);

    // スクリプトがすでに読み込まれている場合（例：ホットリロード時）
    if (window.resetCanvas && !isScriptLoaded) {
      setIsScriptLoaded(true);
      setupCanvasUtils((message) => {
        console.log(message);
      });
      window.resetCanvas();
    }

    return () => {
      window.removeEventListener('error', handleProcessingError);
    };
  }, []);

  // スクリプトの読み込み完了ハンドラー
  const handleScriptLoad = () => {
    console.log('スクリプトが読み込まれました');
    setIsScriptLoaded(true);
    setupCanvasUtils((message) => {
      console.log(message);
    });

    // スクリプトが読み込まれたら、すぐにキャンバスを初期化
    if (window.resetCanvas) {
      window.resetCanvas();
    }
  };

  // ファイルのアップロードハンドラー
  const handleFileChange = (e: FileInputEvent) => {
    const selectedFile = e.target.files[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      // PDEファイルであることを確認
      if (!selectedFile.name.endsWith('.pde')) {
        setError('PDEファイルを選択してください');
        return;
      }

      // ファイルを読み込む
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPdeCode(content);
      };
      reader.onerror = () => {
        setError('ファイルの読み込みに失敗しました');
      };
      reader.readAsText(selectedFile);
    }
  };

  // コード入力の変更ハンドラー
  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPdeCode(e.target.value);
  };

  // フォームのハンドリング
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!pdeCode.trim()) {
      setError('プレビューするコードを入力してください');
      return;
    }

    executePreview();
  };

  // PDEの直接プレビュー
  const executePreview = () => {
    previewProcessingCode(
      pdeCode,
      isScriptLoaded,
      setError,
      setSuccess,
      setIsProcessing,
      setJsCode,
      setCanvasKey
    );
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      // アニメーションループを停止
      if (window.animationFrameId !== undefined) {
        cancelAnimationFrame(window.animationFrameId);
      }
    };
  }, []);

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
          <h1 className="text-3xl font-bold">Processingプレビュー</h1>
          {/* <p className="mt-2 text-gray-600">
            PDEコードを貼り付けて、実行結果をプレビューできます。ファイルをアップロードすることもできます。
          </p> */}
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 左側: コード入力 */}
          <div>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* ファイルアップロード */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h2 className="mb-4 text-lg font-medium">PDEファイルのアップロード (任意)</h2>
                <div className="flex items-center justify-center">
                  <label className="flex w-full cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="mb-3 h-10 w-10 text-gray-400"
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
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">クリックしてファイルを選択</span> または
                        ドラッグ＆ドロップ
                      </p>
                      <p className="text-xs text-gray-500">.pde ファイルのみ</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pde"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {file && (
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-2">
                    <span className="text-sm text-gray-500">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* コード入力 */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">PDEコード</h2>
                  <button
                    type="button"
                    onClick={() => setShowOriginalCode(!showOriginalCode)}
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showOriginalCode ? 'コードを隠す' : 'コードを表示'}
                  </button>
                </div>
                {showOriginalCode && (
                  <textarea
                    value={pdeCode}
                    onChange={handleCodeChange}
                    rows={15}
                    placeholder="void setup() {
  size(200, 200);
}

void draw() {
  background(220);
  ellipse(width/2, height/2, 100, 100);
}"
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-mono text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                )}

                {/* サンプルコード */}
                {!pdeCode && !file && showOriginalCode && (
                  <div className="mt-4 text-sm text-gray-500">
                    <p className="mb-2">サンプルコード:</p>
                    <button
                      type="button"
                      onClick={() =>
                        setPdeCode(`void setup() {
  size(200, 200);
}

void draw() {
  background(220);
  fill(255, 0, 0);
  ellipse(width/2, height/2, 100, 100);
}`)
                      }
                      className="cursor-pointer rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
                    >
                      サンプルを読み込む
                    </button>
                  </div>
                )}
              </div>

              {/* 実行ボタン */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isProcessing || !isScriptLoaded}
                  className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:bg-blue-300"
                >
                  {isProcessing
                    ? '処理中...'
                    : isScriptLoaded
                      ? 'プレビュー実行'
                      : 'スクリプト読み込み中...'}
                </button>
              </div>
            </form>

            {/* 変換されたJSコード */}
            {jsCode && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">変換されたJavaScriptコード</h2>
                  <button
                    type="button"
                    onClick={() => setShowConvertedCode(!showConvertedCode)}
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showConvertedCode ? 'コードを隠す' : 'コードを表示'}
                  </button>
                </div>
                {showConvertedCode && (
                  <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-white">
                    <code>{jsCode}</code>
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* 右側: プレビュー表示 */}
          <div>
            <h2 className="mb-4 text-lg font-medium">プレビュー</h2>
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-gray-200 bg-white p-4 shadow-inner">
              <canvas
                ref={canvasRef}
                id="canvas" // canvas IDを変更してプロジェクトの他のコンポーネントと互換性を持たせる
                key={canvasKey} // キーを変更することで強制的に再レンダリング
                width="200"
                height="200"
                className="border border-gray-300"
              ></canvas>
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <p className="font-medium">使い方:</p>
              <ol className="mt-2 ml-5 list-decimal">
                <li>PDEコードを直接入力するか、.pdeファイルをアップロード</li>
                <li>「プレビュー実行」ボタンをクリックしてプレビューを表示</li>
                <li>左側のパネルでコードを修正し、再度実行して結果を確認</li>
                <li>エラーが発生する場合は「簡易変換」ボタンを試してください</li>
              </ol>
              <p className="mt-4 text-xs text-gray-500">
                注意:
                一部のProcessing機能はサポートされていない場合があります。エラーが発生した場合はコードを調整してみてください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
