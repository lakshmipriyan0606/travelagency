"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { registerAgent } from "@/api/auth.api";
import { ArrowRight, Lock, Mail, User, ShieldAlert, CheckCircle, Ban, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { FormInput } from "@/components/ui/FormInput";
import { FormButton } from "@/components/ui/FormButton";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterFormClient() {
  const [error, setError] = useState<string | null>(null);
  const [regStatus, setRegStatus] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: registerAgent,
    onSuccess: () => {
      setRegStatus("SUCCESS");
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = err as any;
      const status = errorObj?.response?.status;
      const errorCode = errorObj?.response?.data?.error?.errorCode;
      if (status === 409 && errorCode) {
        setRegStatus(errorCode);
      } else {
        setError(errorObj?.response?.data?.error?.message || errorObj?.response?.data?.message || "Failed to register. Please try again.");
      }
    }
  });

  const onSubmit = (data: RegisterValues) => {
    setError(null);
    mutation.mutate(data);
  };

  // Render distinct screens for conflict / success states
  if (regStatus) {
    let title = "";
    let description = "";
    let icon = <CheckCircle className="w-16 h-16 text-blue-500 mx-auto" />;
    let showLoginLink = true;

    switch (regStatus) {
      case "SUCCESS":
      case "ALREADY_PENDING":
        title = "Application Pending";
        description = "Your B2B partner application is currently pending review by our administration team. We will notify you by email once your application has been verified.";
        icon = <CheckCircle className="w-16 h-16 text-blue-500 mx-auto" />;
        showLoginLink = false;
        break;
      case "ALREADY_ACTIVE":
        title = "Account Already Active";
        description = "An active B2B partner account is already registered with this email address. Please sign in to access the dashboard.";
        icon = <User className="w-16 h-16 text-emerald-500 mx-auto" />;
        break;
      case "NEEDS_CORRECTION":
        title = "Correction Required";
        description = "Your B2B application requires updates. Please sign in to view the flagged fields and resubmit your details for approval.";
        icon = <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />;
        break;
      case "ACCOUNT_SUSPENDED":
        title = "Account Suspended";
        description = "This partner account has been suspended by administration. Please contact B2B support to appeal or resolve this status.";
        icon = <Ban className="w-16 h-16 text-red-500 mx-auto" />;
        showLoginLink = false;
        break;
      case "ACCOUNT_REJECTED":
        title = "Application Rejected";
        description = "Your previous partner application was rejected. Please sign in to re-submit your registration form.";
        icon = <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />;
        break;
    }

    return (
      <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-center">
        <div className="mb-6">{icon}</div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-4">{title}</h2>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8">{description}</p>
        {showLoginLink ? (
          <Link
            href="/login"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            Go to Login
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-neutral-500 hover:text-neutral-400 text-sm font-medium transition-colors"
          >
            Back to Login
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Partner Application</h2>
        <p className="text-neutral-400 text-sm mt-2">Join our B2B network</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          registration={register("name")}
          label="Full Name / Agency"
          type="text"
          placeholder="Travel Partners LLC"
          icon={User}
          error={errors.name}
        />

        <FormInput
          registration={register("email")}
          label="Email Address"
          type="email"
          placeholder="hello@travelpartners.com"
          icon={Mail}
          error={errors.email}
        />

        <FormInput
          registration={register("password")}
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
        />

        <FormButton
          isLoading={isSubmitting || mutation.isPending}
          label="Apply Now"
          icon={<ArrowRight size={18} />}
        />
      </form>

      <div className="mt-8 text-center text-sm text-neutral-400">
        Already a partner?{" "}
        <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}
