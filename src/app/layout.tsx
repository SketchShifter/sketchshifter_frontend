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
        <main className="container mx-auto max-w-6xl px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-4">{children}</main>
      </body>
    </html>
  );
}
