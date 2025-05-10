// グローバル型定義
export {};

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
    frameCount: number;
    mouseX: number;
    mouseY: number;
    pmouseX: number;
    pmouseY: number;
    keyIsPressed: boolean;
    key: string;
  }
}
