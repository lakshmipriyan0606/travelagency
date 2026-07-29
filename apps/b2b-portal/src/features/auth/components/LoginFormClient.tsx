"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginAgent } from "@/api/auth.api";
import { ArrowRight, Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginFormClient() {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginAgent,
    onSuccess: (data: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataObj = data as any;
      const resData = dataObj?.data || dataObj;
      const accessToken = resData?.accessToken;
      const refreshToken = resData?.refreshToken;
      const status = resData?.agencyUser?.agency?.status || "active";

      if (accessToken) {
        document.cookie = `b2b_portal_access_token=${accessToken}; path=/; max-age=86400;`;
      }
      if (refreshToken) {
        document.cookie = `b2b_portal_refresh_token=${refreshToken}; path=/; max-age=604800;`;
      }
      document.cookie = `agency_status=${status}; path=/; max-age=86400;`;
      window.location.href = ROUTES.dashboard;
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = err as any;
      const status = errorObj?.response?.status;
      const message = errorObj?.response?.data?.error?.message || errorObj?.response?.data?.message || "";

      if (status === 403) {
        if (message.toLowerCase().includes("pending approval")) {
          document.cookie = "agency_status=pending; path=/; max-age=86400;";
          window.location.href = ROUTES.pendingApproval;
          return;
        } else if (message.toLowerCase().includes("suspended")) {
          document.cookie = "agency_status=suspended; path=/; max-age=86400;";
          window.location.href = ROUTES.suspended;
          return;
        }
      }

      setError(message || "Failed to login. Please check your credentials.");
    }
  });

  const onSubmit = (data: LoginValues) => {
    setError(null);
    mutation.mutate(data);
  };

  const isLoading = isSubmitting || mutation.isPending;

  return (
    <div className="w-full max-w-[460px] p-8 lg:p-10 bg-[#141414]/75 backdrop-blur-[24px] border border-white/8 rounded-[32px] shadow-[0_20px_50px_rgba(248,180,0,0.03)] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">Welcome Back</h2>
          <p className="text-[#B4B4B4] text-sm mt-1.5">Access your partner B2B dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-wider text-[#FFD54A] uppercase mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-[#B4B4B4] group-focus-within:text-[#FFD54A] transition-colors" size={16} />
              <input
                {...register("email")}
                type="email"
                placeholder="agent@travelco.com"
                className="w-full bg-[#090909] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-[#FFD54A]/50 focus:ring-1 focus:ring-[#FFD54A]/30 transition-all placeholder-neutral-600"
              />
            </div>
            {errors.email && (
              <span className="text-red-500 text-[10px] font-bold mt-1.5">{errors.email.message}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold tracking-wider text-[#FFD54A] uppercase">
                Password
              </label>
              <a href="#" className="text-xs text-[#B4B4B4] hover:text-[#FFD54A] transition-colors">
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-[#B4B4B4] group-focus-within:text-[#FFD54A] transition-colors" size={16} />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#090909] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-[#FFD54A]/50 focus:ring-1 focus:ring-[#FFD54A]/30 transition-all placeholder-neutral-600"
              />
            </div>
            {errors.password && (
              <span className="text-red-500 text-[10px] font-bold mt-1.5">{errors.password.message}</span>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded bg-[#090909] border border-white/10 text-[#FFD54A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-[#B4B4B4] select-none cursor-pointer">
              Remember me on this device
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-gradient-to-r from-[#FFD54A] to-[#F8B400] hover:from-[#FFE066] hover:to-[#FFC425] text-black font-extrabold text-xs py-4 shadow-[0_4px_20px_rgba(248,180,0,0.2)] hover:shadow-[0_4px_30px_rgba(248,180,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Options */}
      <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
        <div className="text-center text-xs text-[#B4B4B4]">
          Don&apos;t have a partner account?{" "}
          <Link href={ROUTES.register} className="text-[#FFD54A] hover:text-[#FFE066] font-bold transition-colors">
            Create Account
          </Link>
        </div>

        <div className="flex justify-between text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
          <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-neutral-400 transition-colors">Privacy</a>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
