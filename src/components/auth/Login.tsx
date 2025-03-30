'use client';

import { getAuthSession } from "@/lib/auth";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface InputType {
    email: string
    password: string
}

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<InputType>({
        mode: 'onBlur'
    });

    useEffect(() => {
        const checkAuthSession = async () => {
            const user = await getAuthSession();
            if (user) {
                redirect('/');
            }
        };

        checkAuthSession();
    }, []);

    const loginFailed = (error: Response) => {
        if(error.status === 401){
            setMessage("パスワードが違うか、アカウントが存在しません。")
            setLoading(false);
        }else{
            throw new Error(`unexpect error occuerd: ${error}`);
        }
        return "";
    };

    const loginSuccess = async () => {
        console.log("ログイン成功");
        await router.push('/')
        window.location.reload();
        };

    const loginReq = async (data: InputType) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                loginFailed(res);
                console.error("res;", res)
                throw new Error(`some error occured: ${res}`)
            }
            const response = await res.json();
            const token = response.token;
            const user = response.user;
            await localStorage.setItem("token", token);
            loginSuccess();
        } catch (error: any) {
            throw new Error(`fetch error occured:${error}`);
        }
    };

    const isValid = (data: InputType) => {
        setLoading(true);
        loginReq(data);
    };

    const isInValid = (error: any) => {
        console.error("Validation error:", error);
    };

    return (
        <div className="bg-gray-100 py-10">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
                <div>{message}</div>
                <form onSubmit={handleSubmit(isValid, isInValid)} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            メールアドレス
                        </label>
                        <input
                            {...register("email", { required: "メールアドレスを入力してください" })}
                            className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            type="email"
                            name="email"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            パスワード
                        </label>
                        <input
                            {...register("password", {
                                required: "パスワードを入力してください",
                                minLength: { value: 8, message: "8文字以上入力してください" }
                            })}
                            className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            type="password"
                            name="password"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full px-4 py-2 text-white font-medium rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                            {loading ? "ログイン中..." : "ログイン"}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <a href="login/reset" className="text-blue-500 hover:underline text-sm">
                        パスワードをリセット
                    </a>
                </div>
            </div>
        </div>
    );
};

export { Login };