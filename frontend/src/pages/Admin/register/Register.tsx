"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReusableInput } from "@/components/forms/ReusableInput";
import * as z from "zod";
import { registerSchema } from "@/ZodSchema/schema";
import { useNavigate } from "react-router-dom";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { registerAPI } from "@/api/admin/auth.api";
import { showToast } from "@/lib/utils";

type FormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
    const navigate = useNavigate()
    const { control, handleSubmit } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
    });

    const { mutate, isPending } = useMutationAPIQuery(registerAPI, {
        onSuccess() {
            showToast({
                type: 'success',
                content: 'Account created successfully. Please login.',
                position: 'top-right',
            });
            navigate('/admin/login');
        },
        onError(error: any) {
            showToast({
                type: 'error',
                content: error?.response?.data?.msg || 'Registration failed',
                position: 'top-right',
            });
        },
    });

    const onSubmit = (data: FormData) => {
        mutate(data as any);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow rounded-md">
            <h1 className="text-2xl font-bold mb-4">Create Account</h1>

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
                    disabled={isPending}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 py-3 rounded-md font-semibold transition shadow"
                >
                    {isPending ? 'Creating...' : 'Register'}
                </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-4">
                Already have an account?
                <span className="text-blue-600 underline cursor-pointer ml-1" onClick={() => navigate('/admin/login')}>
                    Login
                </span>
            </p>
        </div>
    );
};

export default RegisterForm;
