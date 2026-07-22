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
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-custom-black via-neutral-900 to-black p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                    {/* Top glass reflection */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#F69520] mb-4 shadow-lg shadow-primary/20">
                            <span className="text-2xl">📝</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
                        <p className="text-neutral-400 text-sm">Join to manage your travel agency</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <ReusableInput
                                control={control}
                                name="email"
                                label={<span className="text-neutral-300 text-sm font-medium">Email Address</span>}
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <ReusableInput
                                control={control}
                                name="password"
                                label={<span className="text-neutral-300 text-sm font-medium">Password</span>}
                                type="password"
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className={`w-full bg-gradient-to-r from-primary to-[#F69520] text-black py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale`}
                        >
                            {isPending ? "Creating..." : "Register"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-neutral-500 text-sm">
                            Already have an account?
                            <button 
                                onClick={() => navigate('/admin/login')}
                                className="text-white font-semibold hover:text-primary transition-colors ml-2 underline underline-offset-4 decoration-white/20 hover:decoration-primary/40"
                            >
                                Login
                            </button>
                        </p>
                    </div>
                </div>
                
                {/* Footer credit */}
                <p className="text-center mt-8 text-neutral-600 text-xs tracking-widest uppercase">
                    Travel Agency Admin Panel V2.0
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
