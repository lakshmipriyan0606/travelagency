"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginAgent } from "@/api/auth.api";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { SimpleCheckbox } from "@travelagency/ui";
import {
  cookieMaxAges,
  loadRememberedEmail,
  persistRememberPreference,
} from "@travelagency/forms";
import { maxAgeSecondsFromJwt } from "@travelagency/utils";

const REMEMBER_NS = "b2b_portal";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginFormClient() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const { email, remember } = loadRememberedEmail(REMEMBER_NS);
    setRememberMe(remember);
    if (email) {
      setValue("email", email);
    }
  }, [setValue]);

  const mutation = useMutation({
    mutationFn: loginAgent,
    onSuccess: (data: unknown, variables: LoginValues & { rememberMe?: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataObj = data as any;
      const resData = dataObj?.data || dataObj;
      const accessToken = resData?.accessToken;
      const refreshToken = resData?.refreshToken;
      const status = resData?.agencyUser?.agency?.status || "active";
      const remember = Boolean(variables.rememberMe);
      const { accessMaxAge: accessFallback, refreshMaxAge: refreshFallback } =
        cookieMaxAges(remember);
      // Align cookie Max-Age with JWT `exp` so session timer / middleware stay honest
      const accessMaxAge = maxAgeSecondsFromJwt(accessToken, accessFallback);
      const refreshMaxAge = maxAgeSecondsFromJwt(refreshToken, refreshFallback);

      persistRememberPreference(REMEMBER_NS, remember, variables.email);

      if (accessToken) {
        document.cookie = `b2b_portal_access_token=${accessToken}; path=/; max-age=${accessMaxAge};`;
      }
      if (refreshToken) {
        document.cookie = `b2b_portal_refresh_token=${refreshToken}; path=/; max-age=${refreshMaxAge};`;
      }
      document.cookie = `agency_status=${status}; path=/; max-age=${accessMaxAge};`;
      window.location.href = ROUTES.dashboard;
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = err as any;
      const status = errorObj?.response?.status;
      const message =
        errorObj?.response?.data?.error?.message ||
        errorObj?.response?.data?.message ||
        "";

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
    },
  });

  const onSubmit = (data: LoginValues) => {
    setError(null);
    mutation.mutate({ ...data, rememberMe });
  };

  const isLoading = isSubmitting || mutation.isPending;

  return (
    <div
      className="flex w-full flex-col justify-between rounded-[28px] border border-white/10 p-5 sm:p-6 lg:p-7 [@media(max-height:900px)]:p-5"
      style={{
        background: "rgba(18,18,20,0.82)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(248,180,0,0.06), 0 0 48px rgba(248,180,0,0.06)",
      }}
    >
      <div>
        <div className="mb-5 lg:mb-6 [@media(max-height:900px)]:mb-4">
          <h2 className="text-2xl font-black tracking-tight text-white lg:text-3xl">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm text-[#B4B4B4]">
            Access your partner B2B dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-900/30 p-3 text-center text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col">
            <label className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FFD54A]">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-3.5 text-[#B4B4B4] transition-colors group-focus-within:text-[#FFD54A]"
                size={16}
              />
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="agent@travelco.com"
                className="w-full rounded-xl border border-white/10 bg-[#090909] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder-neutral-600 focus:border-[#FFD54A]/50 focus:ring-1 focus:ring-[#FFD54A]/30"
              />
            </div>
            {errors.email && (
              <span className="mt-1.5 text-[10px] font-bold text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#FFD54A]">
                Password
              </label>
              <Link
                href={ROUTES.forgotPassword}
                className="text-xs text-[#B4B4B4] transition-colors hover:text-[#FFD54A]"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-3.5 text-[#B4B4B4] transition-colors group-focus-within:text-[#FFD54A]"
                size={16}
              />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#090909] py-3.5 pl-12 pr-12 text-sm text-white outline-none transition-all placeholder-neutral-600 focus:border-[#FFD54A]/50 focus:ring-1 focus:ring-[#FFD54A]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3.5 top-3.5 text-[#B4B4B4] transition-colors hover:text-[#FFD54A] focus:outline-none focus-visible:text-[#FFD54A]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="mt-1.5 text-[10px] font-bold text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <SimpleCheckbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            label="Remember me on this device"
            appearance="inline"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFD54A] to-[#F8B400] py-4 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_4px_20px_rgba(248,180,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#FFE066] hover:to-[#FFC425] hover:shadow-[0_8px_32px_rgba(248,180,0,0.45)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
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

      <div className="mt-5 border-t border-white/5 pt-4 lg:mt-6 lg:pt-5 [@media(max-height:900px)]:mt-4 [@media(max-height:900px)]:pt-3">
        <div className="text-center text-xs text-[#B4B4B4]">
          Don&apos;t have a partner account?{" "}
          <Link
            href={ROUTES.register}
            className="font-bold text-[#FFD54A] transition-colors hover:text-[#FFE066]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
