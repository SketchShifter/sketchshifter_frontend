'use client';

import { useEffect } from 'react';
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
    resetCanvas: () => void;
    executeCode: (code: string) => void;
  }
}

export default function PDEPage() {
  useEffect(() => {
    const logMessages: string[] = [];

    // コンソールログをキャプチャ
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = function (...args) {
      logMessages.push(args.join(' '));
      originalConsoleLog.apply(console, args);
    };

    console.error = function (...args) {
      logMessages.push('ERROR: ' + args.join(' '));
      originalConsoleError.apply(console, args);
    };

    // グローバルにキャンバス初期化関数を設定
    window.resetCanvas = () => {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      if (!canvas) return;

      // グローバルにキャンバス要素を保存
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
    };

    // キャンバスサイズ変更関数
    window.setCanvasSize = (width: number, height: number) => {
      const canvas = window.canvas;
      if (!canvas) return;

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
      } catch (error) {
        console.error('コード実行エラー:', error);
        logMessages.push(`コード実行エラー: ${(error as Error).message}`);
      }
    };

    // 初期キャンバス設定
    window.resetCanvas();

    const runCompiler = () => {
      const code = (document.getElementById('pdeCode') as HTMLTextAreaElement).value;

      try {
        // 前回のアニメーションループを停止
        if (window.animationFrameId !== undefined) {
          cancelAnimationFrame(window.animationFrameId);
          window.animationFrameId = undefined;
        }

        // グローバル関数をクリア
        window.runSetup = undefined;
        window.runDraw = undefined;

        // キャンバスをリセット
        window.resetCanvas();

        // PDEコードをパース
        const tokens = window.tokenize(code);
        const parser = new window.Parser(tokens);
        const ast = parser.parseProgram();
        const jsCode = window.generateJavaScriptFromAST(ast);

        // 生成されたJSコードを表示
        (document.getElementById('output') as HTMLTextAreaElement).value = jsCode;

        // PDEのサイズ設定を処理
        const sizeRegex = /size\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/;
        const sizeMatch = code.match(sizeRegex);

        if (sizeMatch && sizeMatch.length >= 3) {
          const width = parseInt(sizeMatch[1], 10);
          const height = parseInt(sizeMatch[2], 10);

          // キャンバスサイズを設定
          if (window.setCanvasSize) {
            window.setCanvasSize(width, height);
          }
        }

        // APIとコードを結合
        const fullCode = window.processingAPI + '\n' + jsCode + '\n' + window.processingAPI2;

        // 以前のスクリプトを削除
        const oldScript = document.getElementById('compiled-script');
        if (oldScript) {
          oldScript.remove();
        }

        // スクリプト実行のため新しい方法を使用
        try {
          // APIとコードを直接評価して関数を定義
          window.executeCode(fullCode);

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
          }, 100); // 少し遅延を入れて実行
        } catch (err) {
          console.error('スクリプト実行エラー:', err);
          logMessages.push(`スクリプト実行エラー: ${(err as Error).message}`);

          // エラー表示
          const debugOutput = document.getElementById('debugOutput') as HTMLTextAreaElement;
          debugOutput.value = logMessages.join('\n');
          document.getElementById('debugContainer')!.style.display = 'block';
        }
      } catch (e: unknown) {
        console.error('コンパイルエラー:', e);
        alert('コンパイル/実行エラーがあります: ' + (e as Error).message);

        // エラーログを表示
        const debugOutput = document.getElementById('debugOutput') as HTMLTextAreaElement;
        debugOutput.value = logMessages.join('\n');
        document.getElementById('debugContainer')!.style.display = 'block';
      }
    };

    // サンプルコードを読み込み
    fetch('/scripts/samplePDEs1.pde')
      .then((res) => res.text())
      .then((code) => {
        (document.getElementById('pdeCode') as HTMLTextAreaElement).value = code;
      })
      .catch((error) => {
        console.error('サンプルコード読み込みエラー:', error);
        logMessages.push(`サンプルコード読み込みエラー: ${error.message}`);
      });

    // ボタンイベントを設定
    document.getElementById('compileBtn')?.addEventListener('click', runCompiler);

    document.getElementById('showDebugBtn')?.addEventListener('click', () => {
      const debugContainer = document.getElementById('debugContainer')!;
      const debugOutput = document.getElementById('debugOutput') as HTMLTextAreaElement;

      if (debugContainer.style.display === 'none') {
        debugContainer.style.display = 'block';
        debugOutput.value = logMessages.join('\n');
      } else {
        debugContainer.style.display = 'none';
      }
    });

    // クリーンアップ
    return () => {
      if (window.animationFrameId !== undefined) {
        cancelAnimationFrame(window.animationFrameId);
      }
      // コンソールログを元に戻す
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <>
      <Script src="/scripts/runCode.js" strategy="afterInteractive" />

      <div className="mx-auto mt-10 mb-10 max-w-4xl px-4">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-full">
            <h3 className="mb-2 text-lg font-semibold">PDEコード入力：</h3>
            <textarea
              id="pdeCode"
              placeholder="PDEコードを入力してください"
              style={{ width: '100%', height: '150px' }}
              className="w-full rounded-md border-2 border-gray-300 p-3 font-mono text-sm"
            />
          </div>

          <div className="flex w-full flex-row justify-center gap-4">
            <button
              id="compileBtn"
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              コンパイル＆実行を実行
            </button>
            <button
              id="showDebugBtn"
              className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              デバッグ情報表示
            </button>
          </div>

          <div className="w-full">
            <h3 className="mb-2 text-lg font-semibold">変換されたJavaScriptコード：</h3>
            <textarea
              id="output"
              readOnly
              placeholder="変換されたJavaScriptコードが表示されます"
              style={{ width: '100%', height: '300px' }}
              className="w-full rounded-md border-2 border-gray-300 p-3 font-mono text-sm"
            />
          </div>

          <div id="debugContainer" className="w-full" style={{ display: 'none' }}>
            <h3 className="mb-2 text-lg font-semibold">デバッグ情報：</h3>
            <textarea
              title="デバッグ情報"
              id="debugOutput"
              readOnly
              style={{ width: '100%', height: '300px' }}
              className="w-full rounded-md border-2 border-gray-300 bg-gray-50 p-3 font-mono text-sm"
            />
          </div>

          <div className="w-full">
            <h3 className="mb-2 text-lg font-semibold">実行結果：</h3>
            <canvas
              id="canvas"
              className="mx-auto rounded-md border-2 border-gray-300"
              style={{ maxWidth: '100%' }}
            ></canvas>
          </div>
        </div>
      </div>
    </>
  );
}
