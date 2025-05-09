// ProcessingのCanvas操作に関するユーティリティ関数

type LogCallback = (message: string) => void;

// キャンバス初期化関数を設定
export const setupCanvasUtils = (addLogMessage: LogCallback) => {
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
    } catch (error) {
      addLogMessage(`コード実行エラー: ${(error as Error).message}`);
    }
  };
};

// キャンバスを完全に初期化する関数
export const fullCanvasReset = (
  addLogMessage: LogCallback,
  setCanvasKey: (fn: (prev: number) => number) => void
) => {
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
export const compileAndRun = (
  pdeCode: string,
  isScriptLoaded: boolean,
  addLogMessage: LogCallback,
  setJsOutput: (code: string) => void,
  setShowDebug: (show: boolean) => void,
  setCanvasKey: (fn: (prev: number) => number) => void
) => {
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
    fullCanvasReset(addLogMessage, setCanvasKey);

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
