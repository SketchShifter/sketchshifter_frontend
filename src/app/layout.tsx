import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header>
          <nav>
            <Link href="/">ホーム</Link> |<Link href="/artworks">作品一覧</Link> |
            <Link href="/mylist">マイリスト</Link> |<Link href="/login">ログイン</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>SketchShifter</footer>
      </body>
    </html>
  );
}
