"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { registerAgent } from "@/api/auth.api";
import { Loader2, Lock, Mail, ArrowRight, User, ShieldAlert, CheckCircle, Ban, AlertTriangle } from "lucide-react";
import Link from "next/link";

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
    onError: (err: any) => {
      const status = err?.response?.status;
      const errorCode = err?.response?.data?.error?.errorCode;
      if (status === 409 && errorCode) {
        setRegStatus(errorCode);
      } else {
        setError(err?.response?.data?.error?.message || err?.response?.data?.message || "Failed to register. Please try again.");
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Full Name / Agency</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input 
              {...register("name")}
              type="text" 
              placeholder="Travel Partners LLC"
              className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          {errors.name && <p className="text-xs text-red-400 font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input 
              {...register("email")}
              type="email" 
              placeholder="hello@travelpartners.com"
              className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input 
              {...register("password")}
              type="password" 
              placeholder="********"
              className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 font-medium">{errors.password.message}</p>}
        </div>

        <button 
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting || mutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Apply Now <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-neutral-400">
        Already a partner? <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">Sign in</Link>
      </div>
    </div>
  );
}
