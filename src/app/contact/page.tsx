'use client';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">お問い合わせ</h1>
      <div className="prose max-w-none">
        <p className="mb-4">ご質問やお問い合わせは、以下のメールアドレスまでご連絡ください：</p>
        <div className="mb-6 rounded-lg bg-gray-100 p-4">
          <p className="text-lg font-semibold">
            <a href="mailto:shimayuu4979@gmail.com" className="text-blue-600 hover:text-blue-800">
              shimayuu4979@gmail.com
            </a>
          </p>
        </div>
        <p className="mb-4">
          お問い合わせの際は、以下の点についてご記入いただけると、よりスムーズに対応させていただきます：
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>お問い合わせの種類</li>
          <li>具体的な内容</li>
          <li>お名前（任意）</li>
        </ul>
        <p className="text-sm text-gray-600">
          ※ご返信までに数日かかる場合がございます。ご了承ください。
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
