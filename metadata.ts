import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SketchShifter',
  description: 'ProcessingのコードをJavaScriptに変換します',
  openGraph: {
    title: 'Serendicode',
    description: 'ProcessingのコードをJavaScriptに変換します',
    url: 'https://serendicode-sub.click',
    siteName: 'Serendicode',
    images: [
      {
        url: '/ssjs.png',
        width: 1200,
        height: 630,
        alt: 'OGP画像の説明',
      },
    ],
    type: 'website',
  },
};
