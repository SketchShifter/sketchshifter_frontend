'use client';

import { API_URL } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const redirectTo = ""

interface InputType {
    email: string;
    password: string;
}
const Login = () => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<InputType>({
        mode: 'onBlur'
    });
    useEffect(() => {
        const checkAuthSession = async () => {
            const user = await getAuthSession();
            // ログインしてたらリダイレクトする
            if (user) {
                redirect(`${redirectTo}/${user.id}`);
            }
        };

        checkAuthSession();
    }, [])

    // ログインに失敗したときの処理
    const loginFailed = (error: any) => {
        return ""
    }

    // ログインに成功したときの処理
    const loginSuccess = (user_id: string) => {
        redirect(`${redirectTo}/${user_id}`);
    }

    const loginReq = async (data: InputType) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (!res.ok) {
                loginFailed(res);
                throw new Error(`レスポンスステータス: ${res.status}`)
            }
            const responce = await res.json()
            const token = responce.token
            const user = responce.user
            localStorage.setItem("token", token);
            loginSuccess(user.id);
        } catch (error: any) {
            console.error(error.message);
            loginFailed(error);
            return error;
        }
    }

    const isValid = (data: InputType) => {
        alert(`${data.email} is email and password is ${data.password}`);
        setLoading(true);
        loginReq(data);
    };

    const isInValid = (error: any) => {
    };


    return (<>
        <form onSubmit={handleSubmit(isValid, isInValid)} className="max-w-xs center mx-auto flex flex-nowrap flex-col items-center">
            <div className="w-full flex flex-nowrap flex-col p-1">
                <label htmlFor="email">
                    メールアドレス
                </label>
                <input
                    {...register("email", { required: "メールアドレスを入力してください" })}
                    className="border-2 border-solid rounded-sm"
                    type="email"
                    name="email"
                />
                <div className="text-[red] text-xs h-4">
                    {errors.email?.message}
                </div>
            </div>
            <div className="w-full flex flex-nowrap flex-col p-1">
                <label htmlFor="email">
                    パスワード
                </label>
                <input
                    {...register("password", {
                        required: "パスワードを入力してください",
                        minLength: { value: 8, message: "8文字以上入力してください" }
                    })}
                    className="border-2 border-solid rounded-sm"
                    type="password"
                    name="password"
                />
                <div className="text-[red] text-xs h-4">
                    {errors.password?.message}
                </div>
            </div>
            <div className={`px-4 py-2 w-fit rounded-full ${loading ? 'bg-gray-500' : 'bg-black'} text-white`}>
                <input type="submit" value="ログイン" disabled={loading} />
            </div>
            <div>
                <p><a href="login/reset">パスワードをリセット</a></p>

            </div>
        </form>
    </>);
}

export { Login }