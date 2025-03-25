'use client';

import { error } from "console";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface InputType {
    email: string;
    password: string;
}
const Login = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isLoginFailed, setIsLoginFailed] = useState(false);

    const {
        register,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<InputType>({
        mode: 'onBlur'
    });

    const isValid = (data: InputType) => {

    };

    const isInValid = (error: any) => {
        setIsLoginFailed(true);

    };


    return(<>
        <form onSubmit={handleSubmit(isValid, isInValid)} className="max-w-md">
            <div className="flex flex-nowrap flex-col p-1">
                <label htmlFor="email">
                    Email
                </label>
                <input
                    {...register("email", { required: "メールアドレスを入力してください"})}
                    className="border-2 border-solid rounded-sm"
                    type="email"
                    name="email"
                />
                <div className="text-[red] text-xs h-2 m-l-1">
                    {errors.email?.message}
                </div>
            </div>
            <div className="flex flex-nowrap flex-col p-1">
                <label htmlFor="email">
                    Password
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
                <div className="text-[red] text-xs h-2">
                    {errors.password?.message}
                </div>
            </div>
        </form>
    </>);
}

export {Login}