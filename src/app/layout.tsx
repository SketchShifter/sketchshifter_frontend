import Link from 'next/link';
import './globals.css';
import TopBar from '@/components/topbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header>
          <TopBar />
        </header>
        <main>
          <ToastContainer />
          {children}
        </main>
      </body>
    </html>
  );
}
