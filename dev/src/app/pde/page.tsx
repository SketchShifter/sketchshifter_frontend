'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    tokenize: (code: string) => unknown[];
    Parser: new (tokens: unknown[]) => { parseProgram: () => unknown };
    generateJavaScriptFromAST: (ast: unknown) => string;
    processingAPI: string;
    processingAPI2: string;
    canvas?: HTMLCanvasElement;
    ctx?: CanvasRenderingContext2D;
    runSetup?: () => void;
    runDraw?: () => void;
    animationFrameId?: number;
    setCanvasSize?: (width: number, height: number) => void;
    resetCanvas?: () => void;
    executeCode?: (code: string) => void;
  }
}

export default function PDEPage() {
  const [pdeCode, setPdeCode] = useState<string>('');
  const [jsOutput, setJsOutput] = useState<string>('');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [canvasKey, setCanvasKey] = useState<number>(0); // キャンバスの強制的な再レンダリングのためのキー

  // ログメッセージを追加する関数
  const addLogMessage = (message: string) => {
    console.log(message);
    setLogMessages((prev) => [...prev, message]);
  };

  // スクリプトが読み込まれた時の処理
  const handleScriptLoad = () => {
    addLogMessage('スクリプトが読み込まれました');
    setIsScriptLoaded(true);
  };

  // キャンバスを完全に初期化する関数
  const fullCanvasReset = () => {
    // アニメーションループを停止
    if (window.animationFrameId !== undefined) {
      cancelAnimationFrame(window.animationFrameId);
      window.animationFrameId = undefined;
    }

    // グローバル関数をクリア
    window.runSetup = undefined;
    window.runDraw = undefined;

    // キャンバスを強制的に再作成するためにキーを更新
    setCanvasKey((prev) => prev + 1);

    // グローバル参照をクリア
    window.canvas = undefined;
    window.ctx = undefined;

    addLogMessage('キャンバスを完全にクリーンアップしました');

    // 少し遅延を入れてからキャンバスを初期化
    setTimeout(() => {
      if (window.resetCanvas) {
        window.resetCanvas();
      } else {
        addLogMessage('resetCanvas関数が定義されていません');
      }
    }, 50);
  };

  // コンパイルと実行を行う関数
  const runCompiler = () => {
    if (!isScriptLoaded) {
      addLogMessage('スクリプトがまだ読み込まれていません');
      return;
    }

    if (!pdeCode) {
      addLogMessage('PDEコードがありません');
      return;
    }

    addLogMessage('コンパイルを開始します');

    try {
      // キャンバスを完全にクリーンアップ
      fullCanvasReset();

      // 少し遅延を入れて、キャンバスが再作成されるのを待つ
      setTimeout(() => {
        try {
          // PDEコードをパース
          const tokens = window.tokenize(pdeCode);
          const parser = new window.Parser(tokens);
          const ast = parser.parseProgram();
          const jsCode = window.generateJavaScriptFromAST(ast);

          // 生成されたJSコードを表示
          setJsOutput(jsCode);
          addLogMessage('JavaScriptコードへの変換が完了しました');

          // PDEのサイズ設定を処理
          const sizeRegex = /size\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/;
          const sizeMatch = pdeCode.match(sizeRegex);

          if (sizeMatch && sizeMatch.length >= 3) {
            const width = parseInt(sizeMatch[1], 10);
            const height = parseInt(sizeMatch[2], 10);

            // キャンバスサイズを設定
            if (window.setCanvasSize) {
              window.setCanvasSize(width, height);
              addLogMessage(`キャンバスサイズを設定: ${width}x${height}`);
            }
          }

          // APIとコードを結合
          const fullCode = window.processingAPI + '\n' + jsCode + '\n' + window.processingAPI2;

          // コードを実行
          if (window.executeCode) {
            window.executeCode(fullCode);
            addLogMessage('コードを実行しました');
          } else {
            try {
              // 安全に関数をスコープ内で実行
              new Function(fullCode)();
              addLogMessage('コードを実行しました');

              // セットアップと描画の実行
              setTimeout(() => {
                // セットアップを実行
                if (typeof window.runSetup === 'function') {
                  window.runSetup();
                  addLogMessage('setup()を実行しました');
                }

                // 描画ループを開始
                if (typeof window.runDraw === 'function') {
                  addLogMessage('描画ループを開始します');
                  const animate = () => {
                    if (typeof window.runDraw === 'function') {
                      window.runDraw();
                      window.animationFrameId = requestAnimationFrame(animate);
                    }
                  };
                  window.animationFrameId = requestAnimationFrame(animate);
                }
              }, 100);
            } catch (execError) {
              addLogMessage(`スクリプト実行エラー: ${(execError as Error).message}`);
            }
          }
        } catch (parseError) {
          addLogMessage(`コンパイルエラー: ${(parseError as Error).message}`);
          alert('コンパイル/実行エラーがあります: ' + (parseError as Error).message);
          setShowDebug(true);
        }
      }, 100); // キャンバス再作成後に実行するための遅延
    } catch (e: unknown) {
      addLogMessage(`実行エラー: ${(e as Error).message}`);
      alert('エラーがあります: ' + (e as Error).message);
      setShowDebug(true);
    }
  };

  // グローバル関数のセットアップ
  useEffect(() => {
    // キャンバス初期化関数
    window.resetCanvas = () => {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      if (!canvas) {
        addLogMessage('キャンバス要素が見つかりません');
        return;
      }

      // グローバル変数を設定（オリジナルのコードとの互換性のため）
      window.canvas = canvas;

      // キャンバスのサイズをリセット
      canvas.width = 400;
      canvas.height = 400;

      // スタイルを適用
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;

      // コンテキストを取得
      const context = canvas.getContext('2d');
      if (context) {
        // グローバル変数を設定
        window.ctx = context;

        // 背景をクリア
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      addLogMessage('キャンバスを初期化しました');
    };

    // キャンバスサイズ変更関数
    window.setCanvasSize = (width: number, height: number) => {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      if (!canvas) {
        addLogMessage('キャンバス要素が見つかりません');
        return;
      }

      // グローバル変数を設定
      window.canvas = canvas;

      // キャンバスサイズを変更
      canvas.width = width;
      canvas.height = height;

      // スタイルも更新
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // コンテキストを再取得
      const context = canvas.getContext('2d');
      if (context) {
        // グローバル変数を更新
        window.ctx = context;

        // 背景をクリア
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
      }
    };

    // グローバルコード実行関数
    window.executeCode = (code: string) => {
      try {
        // 安全に関数をスコープ内で実行
        new Function(code)();

        // セットアップと描画の実行
        setTimeout(() => {
          // セットアップを実行
          if (typeof window.runSetup === 'function') {
            window.runSetup();
          }

          // 描画ループを開始
          if (typeof window.runDraw === 'function') {
            const animate = () => {
              if (typeof window.runDraw === 'function') {
                window.runDraw();
                window.animationFrameId = requestAnimationFrame(animate);
              }
            };
            window.animationFrameId = requestAnimationFrame(animate);
          }
        }, 100);
      } catch (error) {
        addLogMessage(`コード実行エラー: ${(error as Error).message}`);
        setShowDebug(true);
      }
    };

    // サンプルコードを読み込み
    addLogMessage('サンプルコードを読み込み中...');
    fetch('/scripts/samplePDEs1.pde')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then((code) => {
        setPdeCode(code);
        addLogMessage('サンプルコード読み込み完了');
      })
      .catch((error) => {
        addLogMessage(`サンプルコード読み込みエラー: ${error.message}`);
      });

    // クリーンアップ
    return () => {
      if (window.animationFrameId !== undefined) {
        cancelAnimationFrame(window.animationFrameId);
      }
    };
  }, []);

  // キャンバスキーが変更されたときに実行（デバッグ用）
  useEffect(() => {
    if (canvasKey > 0) {
      addLogMessage(`キャンバスを再作成しました (キー: ${canvasKey})`);
    }
  }, [canvasKey]);

  return (
    <>
      <Script
        src="/scripts/runCode.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={() => addLogMessage('スクリプト読み込みエラー')}
      />

      <div className="mx-auto mt-10 mb-10 max-w-4xl px-4">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-full">
            <h3 className="mb-2 text-lg font-semibold">PDEコード入力：</h3>
            <textarea
              value={pdeCode}
              onChange={(e) => setPdeCode(e.target.value)}
              placeholder="PDEコードを入力してください"
              style={{ width: '100%', height: '150px' }}
              className="w-full rounded-md border-2 border-gray-300 p-3 font-mono text-sm"
            />
          </div>

          <div className="flex w-full flex-row justify-center gap-4">
            <button
              onClick={runCompiler}
              className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              disabled={!isScriptLoaded}
            >
              {isScriptLoaded ? 'コンパイル＆実行' : 'スクリプト読み込み中...'}
            </button>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              {showDebug ? 'デバッグ情報を隠す' : 'デバッグ情報表示'}
            </button>
          </div>

          <div className="w-full">
            <h3 className="mb-2 text-lg font-semibold">変換されたJavaScriptコード：</h3>
            <textarea
              value={jsOutput}
              readOnly
              placeholder="変換されたJavaScriptコードが表示されます"
              style={{ width: '100%', height: '300px' }}
              className="w-full rounded-md border-2 border-gray-300 p-3 font-mono text-sm"
            />
          </div>

          {showDebug && (
            <div className="w-full">
              <h3 className="mb-2 text-lg font-semibold">デバッグ情報：</h3>
              <textarea
                title="デバッグ情報"
                placeholder="デバッグ情報が表示されます"
                value={logMessages.join('\n')}
                readOnly
                style={{ width: '100%', height: '300px' }}
                className="w-full rounded-md border-2 border-gray-300 bg-gray-50 p-3 font-mono text-sm"
              />
            </div>
          )}

          <div className="w-full">
            <h3 className="mb-2 text-lg font-semibold">実行結果：</h3>
            <div className="flex justify-center">
              <canvas
                id="canvas"
                key={canvasKey} // キーを変更することで強制的に再レンダリング
                className="rounded-md border-2 border-gray-300"
                width="400"
                height="400"
              ></canvas>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
