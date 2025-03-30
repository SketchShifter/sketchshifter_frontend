import './globals.css';
import TopBar from '@/components/topbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="ja">
      <body>
        <header>
          <TopBar />
        </header>
        <main className="bg-gray-100">
          <ToastContainer />
          <div>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
