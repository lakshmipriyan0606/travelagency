"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { LoginFormData, loginSchema } from "@/ZodSchema/schema";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/Hook/Admin/useAuth";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { loginAPI } from "@/api/admin/auth.api";

const LoginForm = () => {
    const navigate = useNavigate()
    const { mutate } = useMutationAPIQuery(loginAPI, {
        onSuccess(data) {
            localStorage.setItem('adminSession', btoa(JSON.stringify(data)))
            navigate('/admin/adminpanel')
        },
    })

    const { control, handleSubmit } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        const response = await mutate(data);
    };


    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow rounded-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Welcome Back</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <ReusableInput
                    control={control}
                    name="email"
                    label="Email"
                    required
                />

                <ReusableInput
                    control={control}
                    name="password"
                    label="Password"
                    type="password"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3 rounded-md font-semibold transition shadow"
                >
                    Login
                </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-4">
                Don't have an account?
                <span className="text-blue-600 underline cursor-pointer ml-1" onClick={() => navigate('/admin/register')}>
                    Register
                </span>
            </p>
        </div>
    );
};

export default LoginForm;
