"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DarkFormInput, DarkFormButton } from "@travelagency/forms";
import { LoginFormData, loginSchema } from "@/ZodSchema/schema";
import { useMutationAPIQuery } from "@travelagency/hooks";
import { b2bAdminLogin } from "@/api/b2bAdmin.api";
import { setAdminUser } from "@/store/adminAuthSlice";
import { useDispatch } from "react-redux";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function B2BLoginPage() {
    const dispatch = useDispatch();
    const [loginError, setLoginError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate, isPending } = useMutationAPIQuery(b2bAdminLogin, {
        onSuccess(data: any) {
            // Set cookies for server-side auth guards
            document.cookie = `b2b_access_token=${data.accessToken}; path=/; max-age=86400;`;
            document.cookie = `b2b_refresh_token=${data.refreshToken}; path=/; max-age=604800;`;

            dispatch(
                setAdminUser({
                    id: data.adminUser.id,
                    user: {
                        name: data.adminUser.name,
                        email: data.adminUser.email,
                        exp: Math.floor(Date.now() / 1000) + 15 * 60,
                    },
                    role: data.adminUser.role,
                    isLoggedIn: true,
                })
            );
            window.location.href = "/b2b/admin/dashboard";
        },
        onError(error: any) {
            const rawMessage = error?.message;
            const messageString =
                typeof rawMessage === "object" && rawMessage !== null
                    ? rawMessage.message || rawMessage.error || JSON.stringify(rawMessage)
                    : rawMessage;
            setLoginError(messageString || "Invalid B2B admin credentials.");
        },
    });

    const onSubmit = (data: LoginFormData) => {
        setLoginError(null);
        mutate(data);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-4 relative overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700" />

            <div className="w-full max-w-md relative z-10">
                <div className="w-full p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Admin Login
                        </h2>
                        <p className="text-neutral-400 text-sm mt-2">
                            Sign in to the B2B Admin Console
                        </p>
                    </div>

                    {/* Error */}
                    {loginError && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
                            {loginError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <DarkFormInput
                            registration={register("email")}
                            label="Email Address"
                            type="email"
                            placeholder="admin@travelagency.com"
                            icon={Mail}
                            error={errors.email}
                        />

                        <DarkFormInput
                            registration={register("password")}
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            error={errors.password}
                            labelRight={
                                <a
                                    href="#"
                                    className="text-xs text-primary hover:brightness-110 transition-colors"
                                >
                                    Forgot?
                                </a>
                            }
                        />

                        <DarkFormButton
                            isLoading={isPending}
                            label="Sign In"
                            icon={<ArrowRight size={18} />}
                        />
                    </form>
                </div>

                <p className="text-center mt-8 text-neutral-600 text-xs tracking-widest uppercase">
                    Travel Agency B2B Admin V1.0
                </p>
            </div>
        </div>
    );
}
