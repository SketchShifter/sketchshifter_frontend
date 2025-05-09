// processingEmulator.js
export function setupProcessingEnvironment(canvasElement, jsCode) {
  // 内部変数
  let ctx = null;
  let width = canvasElement.width || 400;
  let height = canvasElement.height || 400;
  let fillColor = 'black';
  let strokeColor = 'black';
  let useStroke = true;
  let useFill = true;
  let rectModeValue = 'corner'; // 'center' または 'corner'
  let ellipseModeValue = 'center'; // 'center' または 'corner'
  let animationFrameId = null;
  let frameCount = 0;
  let frameRate = 60;
  let lastFrameTime = 0;
  let targetFrameTime = 1000 / frameRate;

  // まずcanvasのコンテキストを取得
  ctx = canvasElement.getContext('2d');
  if (!ctx) {
    console.error('Canvasコンテキストを取得できませんでした');
    return () => {};
  }

  // Processing関数の実装
  const processingFunctions = {
    // キャンバスサイズ設定
    size: function (w, h) {
      width = w;
      height = h;
      canvasElement.width = w;
      canvasElement.height = h;
      // サイズ変更後にコンテキストを再取得（重要）
      ctx = canvasElement.getContext('2d');
      // コンテキスト設定を復元
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
    },

    // 描画関数
    background: function (r, g, b, a) {
      if (g === undefined) g = r;
      if (b === undefined) b = r;
      if (a === undefined) a = 255;

      // 値の正規化 (0-255の範囲に)
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      a = Math.min(255, Math.max(0, a)) / 255;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.fillRect(0, 0, width, height);
      // 描画スタイルを復元
      ctx.fillStyle = fillColor;
    },

    ellipse: function (x, y, w, h) {
      ctx.beginPath();

      if (ellipseModeValue === 'corner') {
        // モードがCORNERの場合、座標を調整
        x = x + w / 2;
        y = y + h / 2;
      }

      ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);

      if (useFill) {
        ctx.fill();
      }
      if (useStroke) {
        ctx.stroke();
      }
    },

    circle: function (x, y, diameter) {
      ctx.beginPath();
      ctx.arc(x, y, diameter / 2, 0, Math.PI * 2);
      if (useFill) {
        ctx.fill();
      }
      if (useStroke) {
        ctx.stroke();
      }
    },

    rect: function (x, y, w, h) {
      if (rectModeValue === 'center') {
        x = x - w / 2;
        y = y - h / 2;
      }

      if (useFill) {
        ctx.fillRect(x, y, w, h);
      }
      if (useStroke) {
        ctx.strokeRect(x, y, w, h);
      }
    },

    line: function (x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      if (useStroke) {
        ctx.stroke();
      }
    },

    point: function (x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      if (useStroke) {
        ctx.stroke();
      }
      if (useFill) {
        ctx.fill();
      }
    },

    triangle: function (x1, y1, x2, y2, x3, y3) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      if (useFill) {
        ctx.fill();
      }
      if (useStroke) {
        ctx.stroke();
      }
    },

    quad: function (x1, y1, x2, y2, x3, y3, x4, y4) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      if (useFill) {
        ctx.fill();
      }
      if (useStroke) {
        ctx.stroke();
      }
    },

    bezier: function (x1, y1, x2, y2, x3, y3, x4, y4) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
      if (useStroke) {
        ctx.stroke();
      }
    },

    // スタイル設定
    fill: function (r, g, b, a) {
      if (typeof r === 'number' && g === undefined) {
        // グレースケール
        g = r;
        b = r;
      }

      if (a === undefined) a = 255;

      // 値の正規化
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      a = Math.min(255, Math.max(0, a)) / 255;

      fillColor = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.fillStyle = fillColor;
      useFill = true;
    },

    stroke: function (r, g, b, a) {
      if (typeof r === 'number' && g === undefined) {
        // グレースケール
        g = r;
        b = r;
      }

      if (a === undefined) a = 255;

      // 値の正規化
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      a = Math.min(255, Math.max(0, a)) / 255;

      strokeColor = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.strokeStyle = strokeColor;
      useStroke = true;
    },

    noFill: function () {
      useFill = false;
    },

    noStroke: function () {
      useStroke = false;
    },

    strokeWeight: function (weight) {
      ctx.lineWidth = weight;
    },

    // モード設定
    rectMode: function (mode) {
      if (mode === 'CENTER' || mode === 'center') {
        rectModeValue = 'center';
      } else {
        rectModeValue = 'corner';
      }
    },

    ellipseMode: function (mode) {
      if (mode === 'CENTER' || mode === 'center') {
        ellipseModeValue = 'center';
      } else {
        ellipseModeValue = 'corner';
      }
    },

    // ユーティリティ関数
    constrain: function (value, min, max) {
      return Math.min(Math.max(value, min), max);
    },

    map: function (value, start1, stop1, start2, stop2) {
      return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    },

    dist: function (x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },

    abs: function (n) {
      return Math.abs(n);
    },
    ceil: function (n) {
      return Math.ceil(n);
    },
    floor: function (n) {
      return Math.floor(n);
    },
    round: function (n) {
      return Math.round(n);
    },
    sq: function (n) {
      return n * n;
    },
    sqrt: function (n) {
      return Math.sqrt(n);
    },

    // 三角関数
    sin: function (angle) {
      return Math.sin(angle);
    },
    cos: function (angle) {
      return Math.cos(angle);
    },
    tan: function (angle) {
      return Math.tan(angle);
    },
    asin: function (value) {
      return Math.asin(value);
    },
    acos: function (value) {
      return Math.acos(value);
    },
    atan: function (value) {
      return Math.atan(value);
    },
    atan2: function (y, x) {
      return Math.atan2(y, x);
    },

    // ランダム関数
    random: function (min, max) {
      if (max === undefined) {
        max = min;
        min = 0;
      }
      return min + Math.random() * (max - min);
    },

    randomSeed: function (seed) {
      // 簡易的なシード付き乱数
      if (Math.seedrandom) {
        Math.seedrandom(seed.toString());
      }
    },

    noise: function () {
      // 簡易的なノイズ実装（理想的にはパーリンノイズを実装）
      return Math.random();
    },

    // 変換関数
    translate: function (x, y) {
      ctx.translate(x, y);
    },

    rotate: function (angle) {
      ctx.rotate(angle);
    },

    scale: function (x, y) {
      if (y === undefined) y = x;
      ctx.scale(x, y);
    },

    push: function () {
      ctx.save();
    },

    pop: function () {
      ctx.restore();
    },

    // 時間関数
    setFrameRate: function (fps) {
      frameRate = fps;
      targetFrameTime = 1000 / fps;
    },

    getFrameRate: function () {
      return frameRate;
    },

    getFrameCount: function () {
      return frameCount;
    },

    // テキスト関数
    textSize: function (size) {
      ctx.font = `${size}px sans-serif`;
    },

    text: function (str, x, y) {
      if (useFill) {
        ctx.fillText(str, x, y);
      }
      if (useStroke) {
        ctx.strokeText(str, x, y);
      }
    },

    textAlign: function (horizAlign, vertAlign) {
      ctx.textAlign = horizAlign;
      if (vertAlign) {
        ctx.textBaseline = vertAlign;
      }
    },

    // カラーユーティリティ
    color: function (r, g, b, a) {
      if (g === undefined) g = r;
      if (b === undefined) b = r;
      if (a === undefined) a = 255;

      // 値の正規化
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      a = Math.min(255, Math.max(0, a));

      // 32ビット整数カラー表現を返す
      return ((a & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
    },

    red: function (color) {
      return (color >> 16) & 0xff;
    },

    green: function (color) {
      return (color >> 8) & 0xff;
    },

    blue: function (color) {
      return color & 0xff;
    },

    alpha: function (color) {
      return (color >> 24) & 0xff;
    },

    // イメージ関連
    // Note: この部分は実装が複雑になるため割愛
    // 必要に応じて拡張可能

    // インタラクション変数
    mouseX: 0,
    mouseY: 0,
    pmouseX: 0,
    pmouseY: 0,
    mousePressed: false,

    // イベントハンドラ（実装例）
    updateMousePosition: function (e) {
      const rect = canvasElement.getBoundingClientRect();
      this.pmouseX = this.mouseX;
      this.pmouseY = this.mouseY;
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    },
  };

  const mouseDownHandler = (e) => {
    processingFunctions.mousePressed = true;
    processingFunctions.updateMousePosition(e);
    if (typeof scope.mousePressed === 'function') {
      scope.mousePressed();
    }
  };

  const mouseUpHandler = (e) => {
    processingFunctions.mousePressed = false;
    processingFunctions.updateMousePosition(e);
    if (typeof scope.mouseReleased === 'function') {
      scope.mouseReleased();
    }
  };

  const mouseMoveHandler = (e) => {
    processingFunctions.updateMousePosition(e);
    if (typeof scope.mouseMoved === 'function') {
      scope.mouseMoved();
    }
  };

  // イベントリスナーを登録
  canvasElement.addEventListener('mousedown', mouseDownHandler);
  canvasElement.addEventListener('mouseup', mouseUpHandler);
  canvasElement.addEventListener('mousemove', mouseMoveHandler);

  // Processing定数
  const processingConstants = {
    // モード定数
    CENTER: 'center',
    CORNER: 'corner',
    CORNERS: 'corners',
    RADIUS: 'radius',

    // 角度関連
    PI: Math.PI,
    HALF_PI: Math.PI / 2,
    QUARTER_PI: Math.PI / 4,
    TWO_PI: Math.PI * 2,

    // 色関連
    RGB: 'rgb',
    HSB: 'hsb',

    // 一般的なカラー定数
    WHITE: 0xffffffff,
    BLACK: 0xff000000,
    RED: 0xffff0000,
    GREEN: 0xff00ff00,
    BLUE: 0xff0000ff,
    YELLOW: 0xffffff00,
    CYAN: 0xff00ffff,
    MAGENTA: 0xffff00ff,

    // PImage関連
    BLEND: 'blend',
    ADD: 'add',
    SUBTRACT: 'subtract',

    // テキスト関連
    LEFT: 'left',
    RIGHT: 'right',
    TOP: 'top',
    BOTTOM: 'bottom',

    // その他
    ARROW: 'default',
    CROSS: 'crosshair',
    HAND: 'pointer',
    MOVE: 'move',
    TEXT: 'text',
  };

  // スコープオブジェクトの作成
  const scope = {
    ...processingFunctions,
    ...processingConstants,
    width: width,
    height: height,
    frameCount: 0,
  };

  // 実行環境の作成
  try {
    // セットアップ前の準備
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;

    // コードを評価する関数
    const evalWithScope = new Function(
      'scope',
      `
    with (scope) {
      ${jsCode}
      // setup, drawなどの関数は定義されていない場合もあるため、空のオブジェクトをデフォルト値として設定
      return { 
        setup: typeof setup !== 'undefined' ? setup : null, 
        draw: typeof draw !== 'undefined' ? draw : null,
        mousePressed: typeof mousePressed !== 'undefined' ? mousePressed : null,
        mouseReleased: typeof mouseReleased !== 'undefined' ? mouseReleased : null,
        mouseMoved: typeof mouseMoved !== 'undefined' ? mouseMoved : null,
        keyPressed: typeof keyPressed !== 'undefined' ? keyPressed : null,
        keyReleased: typeof keyReleased !== 'undefined' ? keyReleased : null
      };
    }
  `
    );

    // スコープ内でコードを実行
    const functions = evalWithScope(scope);
    const setupFn = functions.setup;
    const drawFn = functions.draw;

    // イベント関数も取得
    if (functions.mousePressed) scope.mousePressed = functions.mousePressed;
    if (functions.mouseReleased) scope.mouseReleased = functions.mouseReleased;
    if (functions.mouseMoved) scope.mouseMoved = functions.mouseMoved;
    if (functions.keyPressed) scope.keyPressed = functions.keyPressed;
    if (functions.keyReleased) scope.keyReleased = functions.keyReleased;

    // setup関数の実行
    if (typeof setupFn === 'function') {
      setupFn();
    }

    // draw関数のアニメーションループ
    if (typeof drawFn === 'function') {
      const animate = (timestamp) => {
        // フレームレート制御
        const elapsed = timestamp - lastFrameTime;
        if (elapsed >= targetFrameTime) {
          frameCount++;
          scope.frameCount = frameCount;

          // キャンバスの状態を保存して変換をリセット
          ctx.save();

          // draw関数を実行
          drawFn();

          // キャンバスの状態を復元
          ctx.restore();

          // 次のフレームの時間を計算
          lastFrameTime = timestamp - (elapsed % targetFrameTime);
        }

        // 次のフレーム要求
        animationFrameId = requestAnimationFrame(animate);
      };

      lastFrameTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }

    // クリーンアップ関数
    return function cleanup() {
      // アニメーションフレームをキャンセル
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      // イベントリスナーを削除
      canvasElement.removeEventListener('mousedown', mouseDownHandler);
      canvasElement.removeEventListener('mouseup', mouseUpHandler);
      canvasElement.removeEventListener('mousemove', mouseMoveHandler);
    };
  } catch (error) {
    console.error('Processing実行エラー:', error);

    // エラーメッセージをキャンバスに表示
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'red';
    ctx.font = '14px sans-serif';
    ctx.fillText(`エラー: ${error.message}`, 10, 30);

    // スタックトレースも表示
    const lines = error.stack.split('\n');
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      ctx.fillText(lines[i], 10, 50 + i * 20);
    }

    // クリーンアップ関数
    return function cleanup() {
      // イベントリスナーを削除
      canvasElement.removeEventListener('mousedown', mouseDownHandler);
      canvasElement.removeEventListener('mouseup', mouseUpHandler);
      canvasElement.removeEventListener('mousemove', mouseMoveHandler);
    };
  }
}
