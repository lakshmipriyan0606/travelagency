"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginAgent } from "@/api/auth.api";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { DarkFormInput, DarkFormButton } from "@travelagency/forms";
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

  return (
    <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Partner Login</h2>
        <p className="text-neutral-400 text-sm mt-2">Welcome back to the B2B Portal</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <DarkFormInput
          registration={register("email")}
          label="Email Address"
          type="email"
          placeholder="agent@travelco.com"
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
            <a href="#" className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors">
              Forgot?
            </a>
          }
        />

        <DarkFormButton
          isLoading={isSubmitting || mutation.isPending}
          label="Sign In"
          icon={<ArrowRight size={18} />}
        />
      </form>

      <div className="mt-8 text-center text-sm text-neutral-400">
        Don&apos;t have a partner account?{" "}
        <Link href={ROUTES.register} className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
          Apply here
        </Link>
      </div>
    </div>
  );
}
