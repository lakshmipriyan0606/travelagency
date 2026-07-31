"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { resetPasswordAgent } from "@/api/auth.api";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordFormClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState<string | null>(
    token ? null : "Reset link is missing or invalid. Request a new one."
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: resetPasswordAgent,
    onSuccess: () => {
      setSuccess("Password updated. You can sign in with your new password.");
      setError(null);
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = err as any;
      const message =
        errorObj?.response?.data?.error?.message ||
        errorObj?.response?.data?.message ||
        "Unable to reset password. The link may have expired.";
      setError(message);
      setSuccess(null);
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!token) return;
    setError(null);
    setSuccess(null);
    mutation.mutate({ token, password: data.password });
  };

  const isLoading = isSubmitting || mutation.isPending;

  return (
    <div className="w-full max-w-[460px] p-8 lg:p-10 bg-[#141414]/75 backdrop-blur-[24px] border border-white/8 rounded-[32px] shadow-[0_20px_50px_rgba(248,180,0,0.03)]">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight leading-tight">Set new password</h2>
        <p className="text-[#B4B4B4] text-sm mt-1.5">Choose a strong password for your partner account.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-[#F8B400]/10 border border-[#F8B400]/35 rounded-xl text-[#FFD54A] text-xs font-semibold text-center space-y-3">
          <p>{success}</p>
          <Link
            href={ROUTES.login}
            className="inline-flex items-center gap-2 text-[#FFD54A] hover:text-[#FFE066] font-bold"
          >
            Go to sign in <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-wider text-[#FFD54A] uppercase mb-2">
              New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-[#B4B4B4] group-focus-within:text-[#FFD54A] transition-colors" size={16} />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={!token}
                className="w-full bg-[#090909] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white text-sm outline-none focus:border-[#FFD54A]/50 focus:ring-1 focus:ring-[#FFD54A]/30 transition-all placeholder-neutral-600 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3.5 top-3.5 text-[#B4B4B4] hover:text-[#FFD54A] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-[10px] font-bold mt-1.5">{errors.password.message}</span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-wider text-[#FFD54A] uppercase mb-2">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-[#B4B4B4] group-focus-within:text-[#FFD54A] transition-colors" size={16} />
              <input
                {...register("confirmPassword")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={!token}
                className="w-full bg-[#090909] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-[#FFD54A]/50 focus:ring-1 focus:ring-[#FFD54A]/30 transition-all placeholder-neutral-600 disabled:opacity-50"
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-[10px] font-bold mt-1.5">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full rounded-full bg-gradient-to-r from-[#FFD54A] to-[#F8B400] hover:from-[#FFE066] hover:to-[#FFC425] text-black font-extrabold text-xs py-4 shadow-[0_4px_20px_rgba(248,180,0,0.2)] hover:shadow-[0_4px_30px_rgba(248,180,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center gap-2 text-xs text-[#B4B4B4] hover:text-[#FFD54A] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
        <Link
          href={ROUTES.forgotPassword}
          className="text-xs text-[#B4B4B4] hover:text-[#FFD54A] transition-colors"
        >
          Request new link
        </Link>
      </div>
    </div>
  );
}
