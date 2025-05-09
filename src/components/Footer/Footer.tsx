'use client';

const Footer = () => {
  return (
    <footer className="bg-gray-800 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-sm text-white">
            <p>SSJS. All rights reserved.</p>
          </div>
          {/* <div className="flex space-x-4 text-sm text-white">
            <a href="/terms" className="hover:text-gray-300">
              利用規約
            </a>
            <a href="/privacy" className="hover:text-gray-300">
              プライバシーポリシー
            </a>
            <a href="/contact" className="hover:text-gray-300">
              お問い合わせ
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
