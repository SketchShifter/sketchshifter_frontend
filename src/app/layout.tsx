import Link from 'next/link';
import './globals.css';
import TopBar from '@/components/topbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header>
          <TopBar />
        </header>
        <main>{children}</main>
        <footer>SketchShifter</footer>
      </body>
    </html>
  );
}
