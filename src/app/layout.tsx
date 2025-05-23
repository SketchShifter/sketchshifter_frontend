import './globals.css';
import TopBar from '@/components/topbar';
import Footer from '@/components/Footer/Footer';
import { ToastContainer } from 'react-toastify';
import { QueryProvider } from '@/providers/query-provider';
import 'react-toastify/dist/ReactToastify.css';
// import { Metadata } from 'next';
// import ClientToastContainer from '@/components/ToastContainer';

// export const metadata: Metadata = {
//   title: 'SketchShifter',
//   description: 'ProcessingのコードをJavaScriptに変換します',
//   openGraph: {
//     title: 'Serendicode',
//     description: 'ProcessingのコードをJavaScriptに変換します',
//     url: 'https://serendicode-sub.click',
//     siteName: 'Serendicode',
//     images: [
//       {
//         url: '/ssjs.png',
//         width: 1200,
//         height: 630,
//         alt: 'OGP画像の説明',
//       },
//     ],
//     type: 'website',
//   },
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col overflow-y-scroll">
        <QueryProvider>
          <header className="fixed z-997 w-screen">
            <TopBar />
          </header>
          <main className="flex flex-grow flex-col bg-gray-50 pt-18">
            <ToastContainer />
            <div className="flex-grow">{children}</div>
          </main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
