"use client";

import { useState } from "react";

export default function PostPage() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        file: null as File | null,
        thumbnail: null as File | null,
        code_shared: false,
        code_content: "",
        tags: "",
        is_guest: false,
        guest_nickname: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData((prev) => ({
                ...prev,
                [name]: files[0],
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 必須項目のバリデーション
        if (!formData.title || !formData.file) {
            setMessage("タイトルとファイルは必須です。");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);
        formDataToSend.append("description", formData.description);
        if (formData.file) formDataToSend.append("file", formData.file);
        if (formData.thumbnail) formDataToSend.append("thumbnail", formData.thumbnail);
        formDataToSend.append("code_shared", String(formData.code_shared));
        formDataToSend.append("code_content", formData.code_content);
        formDataToSend.append("tags", formData.tags);
        formDataToSend.append("is_guest", String(formData.is_guest));
        formDataToSend.append("guest_nickname", formData.guest_nickname);

        try {
            const token = localStorage.getItem("token"); // ローカルストレージからトークンを取得

            if (!token) {
                setMessage("認証トークンが見つかりません。ログインしてください。");
                return;
            }

            const response = await fetch("https://api.serendicode-sub.click/works", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, // トークンをAuthorizationヘッダーに追加
                },
                body: formDataToSend,
            });

            if (response.ok) {
                setMessage("作品が投稿されました！");
            } else {
                const errorData = await response.json();
                setMessage(`エラー: ${errorData.error || "投稿に失敗しました。"}`);
            }
        } catch (error) {
            setMessage("サーバーに接続できませんでした。");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
                <h1 className="text-2xl font-bold mb-4">作品投稿</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            タイトル *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            説明
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                            ファイル *
                        </label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            onChange={handleFileChange}
                            required
                            className="mt-1 block w-full text-sm text-gray-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                            サムネイル
                        </label>
                        <input
                            type="file"
                            id="thumbnail"
                            name="thumbnail"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="code_shared" className="flex items-center">
                            <input
                                type="checkbox"
                                id="code_shared"
                                name="code_shared"
                                checked={formData.code_shared}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            コードを共有する
                        </label>
                    </div>
                    <div>
                        <label htmlFor="code_content" className="block text-sm font-medium text-gray-700">
                            コード内容
                        </label>
                        <textarea
                            id="code_content"
                            name="code_content"
                            value={formData.code_content}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                            タグ (カンマ区切り)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="is_guest" className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_guest"
                                name="is_guest"
                                checked={formData.is_guest}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            ゲストとして投稿
                        </label>
                    </div>
                    {formData.is_guest && (
                        <div>
                            <label htmlFor="guest_nickname" className="block text-sm font-medium text-gray-700">
                                ゲストニックネーム
                            </label>
                            <input
                                type="text"
                                id="guest_nickname"
                                name="guest_nickname"
                                value={formData.guest_nickname}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        投稿
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
            </div>
        </div>
    );
}