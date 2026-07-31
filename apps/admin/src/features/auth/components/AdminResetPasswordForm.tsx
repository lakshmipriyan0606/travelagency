"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DarkFormInput, DarkFormButton } from "@travelagency/forms";
import { useMutationAPIQuery } from "@travelagency/hooks";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminAuthCard } from "@/components/layout/AdminAuthCard";

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

interface AdminResetPasswordFormProps {
  title: string;
  subtitle: string;
  loginHref: string;
  forgotHref: string;
  resetPassword: (payload: { token: string; password: string }) => Promise<unknown>;
}

export default function AdminResetPasswordForm({
  title,
  subtitle,
  loginHref,
  forgotHref,
  resetPassword,
}: AdminResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState<string | null>(
    token ? null : "Reset link is missing or invalid. Request a new one."
  );
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { mutate, isPending } = useMutationAPIQuery(resetPassword, {
    onSuccess() {
      setSuccess("Password updated. You can sign in with your new password.");
      setError(null);
    },
    onError(err: any) {
      const rawMessage = err?.message;
      const messageString =
        typeof rawMessage === "object" && rawMessage !== null
          ? rawMessage.message || rawMessage.error || JSON.stringify(rawMessage)
          : rawMessage;
      setError(messageString || "Unable to reset password. The link may have expired.");
      setSuccess(null);
    },
  });

  return (
    <AdminAuthCard>
      <div className="mb-7">
        <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
        <p className="mt-1.5 text-sm text-[#B4B4B4]">{subtitle}</p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/50 bg-red-900/30 p-3.5 text-center text-xs font-semibold text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 space-y-3 rounded-xl border border-[#F8B400]/40 bg-[#F8B400]/10 p-3.5 text-center text-xs font-semibold text-[#FFD54A]">
          <p>{success}</p>
          <Link
            href={loginHref}
            className="inline-flex items-center gap-2 font-bold hover:brightness-110"
          >
            Go to sign in <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {!success && (
        <form
          onSubmit={handleSubmit((data) => {
            if (!token) return;
            setError(null);
            setSuccess(null);
            mutate({ token, password: data.password });
          })}
          className="space-y-5"
        >
          <DarkFormInput
            registration={register("password")}
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password}
          />

          <DarkFormInput
            registration={register("confirmPassword")}
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword}
          />

          <DarkFormButton
            isLoading={isPending}
            label="Update Password"
            icon={<ArrowRight size={18} />}
            disabled={!token}
          />
        </form>
      )}

      <div className="mt-6 flex justify-between">
        <Link
          href={loginHref}
          className="inline-flex items-center gap-2 text-xs text-[#B4B4B4] transition-colors hover:text-[#FFD54A]"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
        <Link
          href={forgotHref}
          className="text-xs text-[#B4B4B4] transition-colors hover:text-[#FFD54A]"
        >
          Request new link
        </Link>
      </div>
    </AdminAuthCard>
  );
}
