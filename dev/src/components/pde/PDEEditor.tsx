'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import ProcessingCanvas from './ProcessingCanvas';
import { setupCanvasUtils, compileAndRun } from '@/lib/processing-utils';
import '@/types/global-types';

interface PDEEditorProps {
  initialCode?: string;
  samplePath?: string;
}

const PDEEditor: React.FC<PDEEditorProps> = ({
  initialCode = '',
  samplePath = '/scripts/samplePDEs1.pde',
}) => {
  const [pdeCode, setPdeCode] = useState<string>(initialCode);
  const [jsOutput, setJsOutput] = useState<string>('');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [canvasKey, setCanvasKey] = useState<number>(0);

  // ログメッセージを追加する関数 - useCallbackでメモ化
  const addLogMessage = useCallback((message: string) => {
    console.log(message);
    setLogMessages((prev) => [...prev, message]);
  }, []);

  // スクリプトが読み込まれた時の処理
  const handleScriptLoad = useCallback(() => {
    addLogMessage('スクリプトが読み込まれました');
    setIsScriptLoaded(true);
  }, [addLogMessage]);

  // 実行ボタンのハンドラー - useCallbackでメモ化
  const handleRunCode = useCallback(() => {
    compileAndRun(pdeCode, isScriptLoaded, addLogMessage, setJsOutput, setShowDebug, setCanvasKey);
  }, [pdeCode, isScriptLoaded, addLogMessage]);

  // グローバル関数のセットアップ
  useEffect(() => {
    // キャンバス操作用のユーティリティ関数をセットアップ
    setupCanvasUtils(addLogMessage);

    // サンプルコードを読み込み
    if (initialCode === '' && samplePath) {
      addLogMessage('サンプルコードを読み込み中...');
      fetch(samplePath)
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
    }

    // クリーンアップ
    return () => {
      if (window.animationFrameId !== undefined) {
        cancelAnimationFrame(window.animationFrameId);
      }
    };
  }, [initialCode, samplePath, addLogMessage]);

  return (
    <>
      <Script
        src="/scripts/runCode.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={() => addLogMessage('スクリプト読み込みエラー')}
      />

      <div className="mx-auto max-w-4xl px-4">
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
              onClick={handleRunCode}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              disabled={!isScriptLoaded}
            >
              {isScriptLoaded ? 'コンパイル＆実行' : 'スクリプト読み込み中...'}
            </button>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
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

          <ProcessingCanvas canvasKey={canvasKey} logMessage={addLogMessage} />
        </div>
      </div>
    </>
  );
};

export default PDEEditor;
