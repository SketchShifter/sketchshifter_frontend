'use client';

const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">プライバシーポリシー</h1>
      <div className="prose max-w-none">
        <h2 className="mb-4 text-xl font-semibold">1. はじめに</h2>
        <p className="mb-4">
          SSJS（以下「当サービス」）は、ProcessingSketchBookサービス（以下「本サービス」）におけるユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。
        </p>

        <h2 className="mb-4 text-xl font-semibold">2. 収集する個人情報</h2>
        <p className="mb-4">当サービスは、以下の個人情報を収集する場合があります：</p>
        <ul className="mb-4 list-disc pl-6">
          <li>氏名</li>
          <li>メールアドレス</li>
          <li>アップロードされた画像データ</li>
          <li>アクセスログ情報（IPアドレス、ブラウザ情報、アクセス日時等）</li>
          <li>その他、本サービスの利用に必要な情報</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold">3. 個人情報の利用目的</h2>
        <p className="mb-4">当サービスは、収集した個人情報を以下の目的で利用します：</p>
        <ul className="mb-4 list-disc pl-6">
          <li>本サービスの提供・運営</li>
          <li>ユーザーサポートの提供</li>
          <li>サービスの改善・開発</li>
          <li>セキュリティの確保</li>
          <li>法令に基づく対応</li>
          <li>その他、本サービスの利用に関連する目的</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold">4. 個人情報の管理</h2>
        <p className="mb-4">
          当サービスは、個人情報の漏洩、滅失、毀損を防止するため、以下の措置を講じます：
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>個人情報へのアクセス制限</li>
          <li>その他、適切な安全管理措置の実施</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold">5. 個人情報の第三者提供</h2>
        <p className="mb-4">
          当サービスは、以下の場合を除き、個人情報を第三者に提供することはありません：
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>ユーザーの同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合</li>
          <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold">6. 個人情報の開示・訂正・利用停止</h2>
        <p className="mb-4">
          ユーザーは、当サービスが保有する個人情報について、開示、訂正、利用停止等を請求することができます。
          請求を行う場合は、本人確認の上、合理的な範囲で対応いたします。
        </p>

        <h2 className="mb-4 text-xl font-semibold">7. アクセス解析ツールの利用</h2>
        <p className="mb-4">
          当サービスは、サービスの利用状況を把握するため、Vercel社のアナリティクス等のアクセス解析ツールを使用しています。
          これらのツールは、Cookieなどを使用して情報を収集します。
        </p>

        <h2 className="mb-4 text-xl font-semibold">8. プライバシーポリシーの変更</h2>
        <p className="mb-4">
          当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
          変更後のプライバシーポリシーは、本サービス上での告知をもって効力を生じるものとします。
        </p>

        <h2 className="mb-4 text-xl font-semibold">9. お問い合わせ</h2>
        <p className="mb-4">
          本プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください：
        </p>
        <p className="mb-4">
          <a href="mailto:shimayuu4979@gmail.com" className="text-blue-600 hover:text-blue-800">
            shimayuu4979@gmail.com
          </a>
        </p>

        <p className="mt-8 text-sm text-gray-600">制定日：2025年5月01日</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
