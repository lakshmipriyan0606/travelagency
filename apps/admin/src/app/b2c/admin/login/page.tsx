"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DarkFormInput,
  DarkFormButton,
  DarkRememberCheckbox,
  loadRememberedEmail,
  persistRememberPreference,
} from "@travelagency/forms";
import { LoginFormData, loginSchema } from "@/ZodSchema/schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutationAPIQuery } from "@travelagency/hooks";
import { loginAPI } from "@/api/auth.api";
import { setAdminUser } from "@/store/adminAuthSlice";
import { useDispatch } from "react-redux";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { AdminAuthShell } from "@/components/layout/AdminAuthShell";
import { AdminAuthCard } from "@/components/layout/AdminAuthCard";

const REMEMBER_NS = "b2c_admin";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const { email, remember } = loadRememberedEmail(REMEMBER_NS);
    setRememberMe(remember);
    if (email) setValue("email", email);
  }, [setValue]);

  const { mutate, isPending } = useMutationAPIQuery(loginAPI, {
    onSuccess(data: any, variables: any) {
      const email = variables?.email || "";
      persistRememberPreference(REMEMBER_NS, rememberMe, email);
      dispatch(
        setAdminUser({
          id: data.user._id,
          user: {
            name: data.user.name,
            email: data.user.email,
            exp: data.user.exp,
          },
          role: data.user.role,
          isLoggedIn: true,
        })
      );
      const next = searchParams.get("next");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.push(safeNext || ROUTES.dashboard);
    },
    onError(error: any) {
      const rawMessage = error?.message;
      const messageString =
        typeof rawMessage === "object" && rawMessage !== null
          ? rawMessage.message || rawMessage.error || JSON.stringify(rawMessage)
          : rawMessage;
      setLoginError(messageString || "Invalid admin credentials.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setLoginError(null);
    mutate({ ...data, rememberMe });
  };

  return (
    <AdminAuthShell variant="b2c">
      <AdminAuthCard
        footer={
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[#52525B]">
            Travel Agency Admin Panel V2.0
          </p>
        }
      >
        <div className="mb-4 lg:mb-4">
          <h2 className="text-xl font-black tracking-tight text-white lg:text-2xl">
            Welcome Back
          </h2>
          <p className="mt-0.5 text-sm text-[#B4B4B4]">
            Sign in to manage your travel agency
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
                href={ROUTES.forgotPassword}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AdminAuthShell variant="b2c">
          <AdminAuthCard>
            <p className="text-center text-sm text-[#B4B4B4]">Loading…</p>
          </AdminAuthCard>
        </AdminAuthShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
