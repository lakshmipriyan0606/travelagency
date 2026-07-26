"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginAgent } from "@/api/auth.api";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    onSuccess: (data: any) => {
      // Set the agency_status cookie based on the success response payload
      const status = data?.user?.agency?.status || "active";
      document.cookie = `agency_status=${status}; path=/; max-age=86400;`;
      window.location.href = "/dashboard";
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const message = err?.response?.data?.error?.message || err?.response?.data?.message || "";
      
      // Branch on 403 reasons to route to correct informational screens
      if (status === 403) {
        if (message.toLowerCase().includes("pending approval")) {
          document.cookie = "agency_status=pending; path=/; max-age=86400;";
          window.location.href = "/pending-approval";
          return;
        } else if (message.toLowerCase().includes("suspended")) {
          document.cookie = "agency_status=suspended; path=/; max-age=86400;";
          window.location.href = "/suspended";
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input 
              {...register("email")}
              type="email" 
              placeholder="agent@travelco.com"
              className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Password</label>
            <a href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Forgot?</a>
          </div>
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
            <>Sign In <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-neutral-400">
        Don't have a partner account? <Link href="/register" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">Apply here</Link>
      </div>
    </div>
  );
}
