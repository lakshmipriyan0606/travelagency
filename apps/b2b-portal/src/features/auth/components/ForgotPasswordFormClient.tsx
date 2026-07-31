"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordAgent } from "@/api/auth.api";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordFormClient() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: forgotPasswordAgent,
    onSuccess: (data: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = data as any;
      setSuccess(
        payload?.message ||
          "If an account exists for that email, a password reset link has been sent."
      );
      setError(null);
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = err as any;
      const message =
        errorObj?.response?.data?.error?.message ||
        errorObj?.response?.data?.message ||
        "Unable to send reset email. Please try again.";
      setError(message);
      setSuccess(null);
    },
  });

  const onSubmit = (data: FormValues) => {
    setError(null);
    setSuccess(null);
    mutation.mutate(data);
  };

  const isLoading = isSubmitting || mutation.isPending;

  return (
    <div className="w-full max-w-[460px] p-8 lg:p-10 bg-[#141414]/75 backdrop-blur-[24px] border border-white/8 rounded-[32px] shadow-[0_20px_50px_rgba(248,180,0,0.03)]">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight leading-tight">Forgot password</h2>
        <p className="text-[#B4B4B4] text-sm mt-1.5">
          Enter your partner email and we&apos;ll send a reset link.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-[#F8B400]/10 border border-[#F8B400]/35 rounded-xl text-[#FFD54A] text-xs font-semibold text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold tracking-wider text-[#FFD54A] uppercase mb-2">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-3.5 text-[#B4B4B4] group-focus-within:text-[#FFD54A] transition-colors" size={16} />
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="agent@travelco.com"
              className="w-full bg-[#090909] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-[#FFD54A]/50 focus:ring-1 focus:ring-[#FFD54A]/30 transition-all placeholder-neutral-600"
            />
          </div>
          {errors.email && (
            <span className="text-red-500 text-[10px] font-bold mt-1.5">{errors.email.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-gradient-to-r from-[#FFD54A] to-[#F8B400] hover:from-[#FFE066] hover:to-[#FFC425] text-black font-extrabold text-xs py-4 shadow-[0_4px_20px_rgba(248,180,0,0.2)] hover:shadow-[0_4px_30px_rgba(248,180,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5">
        <Link
          href={ROUTES.login}
          className="inline-flex items-center gap-2 text-xs text-[#B4B4B4] hover:text-[#FFD54A] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
