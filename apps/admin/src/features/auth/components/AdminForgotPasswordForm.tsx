"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DarkFormInput, DarkFormButton } from "@travelagency/forms";
import { useMutationAPIQuery } from "@travelagency/hooks";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { AdminAuthCard } from "@/components/layout/AdminAuthCard";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof schema>;

interface AdminForgotPasswordFormProps {
  title: string;
  subtitle: string;
  loginHref: string;
  requestReset: (payload: { email: string }) => Promise<unknown>;
}

export default function AdminForgotPasswordForm({
  title,
  subtitle,
  loginHref,
  requestReset,
}: AdminForgotPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const { mutate, isPending } = useMutationAPIQuery(requestReset, {
    onSuccess(data: any) {
      setSuccess(
        data?.message ||
          "If an account exists for that email, a password reset link has been sent."
      );
      setError(null);
    },
    onError(err: any) {
      const rawMessage = err?.message;
      const messageString =
        typeof rawMessage === "object" && rawMessage !== null
          ? rawMessage.message || rawMessage.error || JSON.stringify(rawMessage)
          : rawMessage;
      setError(messageString || "Unable to send reset email. Please try again.");
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
        <div className="mb-5 rounded-xl border border-[#F8B400]/40 bg-[#F8B400]/10 p-3.5 text-center text-xs font-semibold text-[#FFD54A]">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => {
          setError(null);
          setSuccess(null);
          mutate(data);
        })}
        className="space-y-5"
      >
        <DarkFormInput
          registration={register("email")}
          label="Email Address"
          type="email"
          placeholder="admin@travelagency.com"
          icon={Mail}
          error={errors.email}
        />

        <DarkFormButton
          isLoading={isPending}
          label="Send Reset Link"
          icon={<ArrowRight size={18} />}
        />
      </form>

      <div className="mt-6">
        <Link
          href={loginHref}
          className="inline-flex items-center gap-2 text-xs text-[#B4B4B4] transition-colors hover:text-[#FFD54A]"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </AdminAuthCard>
  );
}
