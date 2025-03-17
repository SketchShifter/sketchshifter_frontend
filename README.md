# sketchshifter_front(フロントエンド)

## とりあえず始める

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/processing-share-platform-frontend.git
cd processing-share-platform-frontend

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# もし競合したら
git pull --rebase origin main

```

## 機能概要

- Processing作品の閲覧・共有
- ユーザー認証（登録・ログイン）
- 作品へのコメント・いいね機能
- お気に入り登録機能
- 作品検索（タイトル/タグ/投稿者）
- ゲスト投稿・プレビュー機能

## 環境構築

### 必要条件

- Node.js 19.0以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/processing-share-platform-frontend.git
cd processing-share-platform-frontend

# 依存パッケージのインストール
npm install
# または
yarn install

# 開発サーバーの起動
npm run dev
# または
yarn dev
```

### 環境変数の設定

`.env.local`ファイルをプロジェクトルートに作成し、以下の変数を設定します：

```
後で実行
```

```
app/
├── page.tsx                     # ホームページ
├── artworks/                    # 作品一覧・詳細
│   └── [id]/                    # 作品詳細ページ
├── mylist/                      # マイリスト
│   ├── submit/                  # 作品投稿
│   └── edit/[id]/               # 作品編集
├── guests/                      # ゲスト機能
│   ├── submit/                  # ゲスト投稿
│   └── preview/                 # プレビュー
├── login/                       # ログイン
├── register/                    # アカウント登録
└── components/                  # 共通コンポーネント
```

## API連携

バックエンドAPIとの通信は`app/lib/api.ts`で管理されています。主な機能：

- 作品の取得・投稿・更新・削除
- コメントの取得・投稿
- いいね・お気に入り機能
- ユーザー認証

## 開発ガイドライン

- コンポーネントは再利用可能な設計にする
- Tailwind CSSを使用したスタイリング
- React Queryを使用したデータフェッチング
- 認証状態はコンテキストで管理

## ビルドと本番デプロイ

```bash
# ビルド
npm run build

# 本番サーバー起動
npm run start
```
