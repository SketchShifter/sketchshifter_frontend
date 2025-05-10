'use client';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">利用規約</h1>
      <div className="prose max-w-none">
        <h2 className="mb-4 text-xl font-semibold">1. はじめに</h2>
        <p className="mb-4">
          本規約は、SSJS（以下「当サービス」）が提供するProcessingSketchBookサービス（以下「本サービス」）の利用条件を定めるものです。
          ユーザーは本規約に同意の上、本サービスを利用するものとします。
        </p>

        <h2 className="mb-4 text-xl font-semibold">2. 定義</h2>
        <p className="mb-4">本規約において、以下の用語は以下の意味で使用します：</p>
        <ul className="mb-4 list-disc pl-6">
          <li>「ユーザー」とは、本サービスを利用する個人または法人を指します。</li>
          <li>
            「コンテンツ」とは、ユーザーが本サービスにアップロードする画像、テキスト、その他のデータを指します。
          </li>
          <li>「生成コンテンツ」とは、本サービスを通じてAIによって生成された画像を指します。</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold">3. サービスの利用</h2>
        <p className="mb-4">
          3.1 ユーザーは、本サービスを利用するにあたり、以下の条件を満たす必要があります：
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>本規約に同意していること</li>
          <li>正確な情報を登録していること</li>
          <li>法令および本規約を遵守すること</li>
        </ul>

        <p className="mb-4">3.2 本サービスの利用は、ユーザーの責任において行われるものとします。</p>

        <h2 className="mb-4 text-xl font-semibold">4. 禁止事項</h2>
        <p className="mb-4">ユーザーは、以下の行為を行ってはならないものとします：</p>
        <ul className="mb-4 list-disc pl-6">
          <li>法令違反行為</li>
          <li>他者の知的財産権、肖像権、プライバシー権等を侵害する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>他のユーザーに迷惑をかける行為</li>
          <li>本サービスを不正に利用する行為</li>
          <li>その他、当サービスが不適切と判断する行為</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold">5. 知的財産権</h2>
        <p className="mb-4">
          5.1 本サービスに関する知的財産権は、当サービスまたは正当な権利者に帰属します。
        </p>
        <p className="mb-4">
          5.2 ユーザーがアップロードしたコンテンツに関する権利は、当該ユーザーに帰属します。
        </p>
        <p className="mb-4">
          5.3 生成コンテンツの利用権は、当サービスの定める範囲内でユーザーに付与されます。
        </p>

        <h2 className="mb-4 text-xl font-semibold">6. 免責事項</h2>
        <p className="mb-4">
          6.1 当サービスは、本サービスの利用により生じた損害について、一切の責任を負いません。
        </p>
        <p className="mb-4">
          6.2 当サービスは、本サービスの内容、機能、品質等について、保証するものではありません。
        </p>

        <h2 className="mb-4 text-xl font-semibold">7. サービスの変更・終了</h2>
        <p className="mb-4">
          当サービスは、以下の場合に本サービスの内容を変更または終了することがあります：
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>システムの保守点検を行う場合</li>
          <li>天災等の不可抗力により本サービスの提供が困難となった場合</li>
          <li>その他、当サービスが必要と判断した場合</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold">8. 規約の変更</h2>
        <p className="mb-4">
          当サービスは、必要に応じて本規約を変更することがあります。変更後の規約は、本サービス上での告知をもって効力を生じるものとします。
        </p>

        <p className="mt-8 text-sm text-gray-600">制定日：2025年5月01日</p>
      </div>
    </div>
  );
};

export default TermsPage;
