"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DarkFormInput,
  DarkFormButton,
  DarkRememberCheckbox,
  cookieMaxAges,
  loadRememberedEmail,
  persistRememberPreference,
} from "@travelagency/forms";
import { getJwtExpirySeconds, maxAgeSecondsFromJwt } from "@travelagency/utils";
import { LoginFormData, loginSchema } from "@/ZodSchema/schema";
import { useMutationAPIQuery } from "@travelagency/hooks";
import { b2bAdminLogin } from "@/api/b2bAdmin.api";
import { setAdminUser } from "@/store/adminAuthSlice";
import { useDispatch } from "react-redux";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { AdminAuthShell } from "@/components/layout/AdminAuthShell";
import { AdminAuthCard } from "@/components/layout/AdminAuthCard";

const REMEMBER_NS = "b2b_admin";

export default function B2BLoginPage() {
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const { email, remember } = loadRememberedEmail(REMEMBER_NS);
    setRememberMe(remember);
    if (email) setValue("email", email);
  }, [setValue]);

  const { mutate, isPending } = useMutationAPIQuery(b2bAdminLogin, {
    onSuccess(data: any, variables: any) {
      const { accessMaxAge: accessFallback, refreshMaxAge: refreshFallback } =
        cookieMaxAges(rememberMe);
      const accessMaxAge = maxAgeSecondsFromJwt(data.accessToken, accessFallback);
      const refreshMaxAge = maxAgeSecondsFromJwt(data.refreshToken, refreshFallback);
      persistRememberPreference(REMEMBER_NS, rememberMe, variables?.email || "");

      document.cookie = `b2b_access_token=${data.accessToken}; path=/; max-age=${accessMaxAge};`;
      document.cookie = `b2b_refresh_token=${data.refreshToken}; path=/; max-age=${refreshMaxAge};`;

      dispatch(
        setAdminUser({
          id: data.adminUser.id,
          user: {
            name: data.adminUser.name,
            email: data.adminUser.email,
            exp: getJwtExpirySeconds(data.accessToken) ?? undefined,
          },
          role: data.adminUser.role,
          isLoggedIn: true,
        })
      );
      window.location.href = ROUTES.b2b.dashboard;
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
    mutate({ ...data, rememberMe });
  };

  return (
    <AdminAuthShell variant="b2b">
      <AdminAuthCard
        footer={
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#52525B]">
            Travel Agency B2B Admin V1.0
          </p>
        }
      >
        <div className="mb-4 lg:mb-4">
          <h2 className="text-xl font-black tracking-tight text-white lg:text-2xl">
            Admin Login
          </h2>
          <p className="mt-0.5 text-sm text-[#B4B4B4]">
            Sign in to the B2B Admin Console
          </p>
        </div>

        {loginError && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-900/30 p-3 text-center text-xs font-semibold text-red-400">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
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
              <Link
                href={ROUTES.b2b.forgotPassword}
                className="text-xs text-[#FFD54A] transition-colors hover:text-[#FFE066]"
              >
                Forgot?
              </Link>
            }
          />

          <DarkRememberCheckbox
            checked={rememberMe}
            onCheckedChange={setRememberMe}
          />

          <DarkFormButton
            isLoading={isPending}
            label="Sign In"
            icon={<ArrowRight size={18} />}
          />
        </form>
      </AdminAuthCard>
    </AdminAuthShell>
  );
}
