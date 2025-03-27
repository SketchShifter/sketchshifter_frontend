'use client';

import { API_URL } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, FieldError, FieldErrors } from "react-hook-form";

const redirectTo = ""

interface InputType {
    email: string;
    password: string;
    passwordRe: string;
    name: string;
    nickname: string;
}
interface InputProps {
    name: "password" | "email" | "passwordRe" | "name" | "nickname",
    type: string
    label: string
    reqMsg: string
}
const Register = () => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<InputType>({
        mode: 'onBlur'
    });
    useEffect(() => {
        const checkAuthSession = async () => {
            const user = await getAuthSession();
            // ログインしてたらリダイレクトする
            if (user){
                redirect(`${redirectTo}/${user.id}`);
            }
        };

        checkAuthSession();
    },[])

    // ログインに失敗したときの処理
    const loginFailed = (error: any) => {
        return ""
    }

    // ログインに成功したときの処理
    const loginSuccess = (user_id: string) => {
        redirect(`${redirectTo}/${user_id}`);
    }

    const registerReq = async (data: InputType) => {
        try {
            if (data.password != data.passwordRe){
                isInValid({error: "password is not match"})
                return null
            }
            const setData = {
                email: data.email,
                password: data.password,
                name: data.name,
                nickname: data.nickname
            }
            const res = await fetch(`${API_URL}/auth/register`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(setData)
            })
            if(!res.ok) {
                if(res.status === 409){
                    alert("既に登録されています。");
                    redirect(`/login`);
                }
                loginFailed(res);
                throw new Error(`レスポンスステータス: ${res.status}`)
            }
            const responce = await res.json()
            const token = responce.token
            const user = responce.user
            localStorage.setItem("token",token);
            loginSuccess(user.id);
        }catch(error: any){
            console.error(error.message);
            loginFailed(error);
            return error;
        }
    }

    const isValid = (data: InputType) => {
        setLoading(true);
        alert(`${data.email} is email and password is ${data.password}`);
        registerReq(data);
    };

    const isInValid = (error: any) => {
    };

    const Input = ({name,type,label,reqMsg}: InputProps) => {
        return(<>
            <div className="w-full flex flex-nowrap flex-col p-1">
                <label htmlFor={name}>
                    {label}
                </label>
                <input
                    {...register(name, { required: reqMsg})}
                    className="border-2 border-solid rounded-sm"
                    type={type}
                    name={name}
                />
                <div className="text-[red] text-xs h-4">
                    {(errors as Record<string, FieldError>)[name]?.message}
                </div>
            </div>
        </>)
    }

    return(<>
        <form onSubmit={handleSubmit(isValid, isInValid)} className="max-w-xs center mx-auto flex flex-nowrap flex-col items-center">
            <Input
                name="name"
                type="text"
                label="名前を入力"
                reqMsg="名前を入力してください"
            />
            <Input
                name="nickname"
                type="text"
                label="ニックネーム"
                reqMsg="ニックネームを入力してください"
            />
            <Input
                name="email"
                type="email"
                label="メールアドレス"
                reqMsg="メールアドレスを入力してください"
            />
            <div className="w-full flex flex-nowrap flex-col p-1">
                <label htmlFor="password">
                    パスワード
                </label>
                <input
                    {...register("password", {
                        required: "パスワードを入力してください",
                        minLength: { value: 8, message: "8文字以上入力してください"}
                    })}
                    className="border-2 border-solid rounded-sm"
                    type="password"
                    name="password"
                />
                <div className="text-[red] text-xs h-4">
                    {errors.password?.message}
                </div>
            </div>
            <div className="w-full flex flex-nowrap flex-col p-1">
                <label htmlFor="passwordRe">
                    パスワードを再入力
                </label>
                <input
                    {...register("passwordRe", {
                        required: "パスワードを再入力してください",
                        minLength: { value: 8, message: "8文字以上入力してください"},
                        validate: {
                            matchesPreviousPassword: (value) => {
                                const { password } = getValues();
                                return password === value || "パスワードが一致しません";
                            }
                        }
                    })}
                    className="border-2 border-solid rounded-sm"
                    type="password"
                    name="passwordRe"
                />
                <div className="text-[red] text-xs h-4">
                    {errors.passwordRe?.message}
                </div>
            </div>
            <div className={`px-4 py-2 w-fit rounded-full ${loading ? 'bg-gray-500' : 'bg-black'} text-white`}>
                <input type="submit" value="登録する" disabled={loading} />
            </div>
        </form>
    </>);
}

export {Register}