"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { devopsApi } from "@/features/devops/api";

export default function DevopsLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    // If already have devops session, go dashboard
    void devopsApi
      .session()
      .then(() => router.replace(ROUTES.devops.executive))
      .catch(() => undefined);
  }, [router]);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await devopsApi.bootstrap();
      const data = (res as { data?: { devOtp?: string } }).data;
      if (data?.devOtp) setDevOtp(data.devOtp);
      router.push(ROUTES.devops.otp);
    } catch (e: unknown) {
      const msg =
        typeof e === "object" &&
        e &&
        "response" in e &&
        (e as { response?: { data?: { message?: string }; status?: number } })
          .response?.data?.message
          ? (e as { response: { data: { message: string } } }).response.data
              .message
          : "Bootstrap failed. Sign in as B2C superadmin first.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#F8B400]/15 flex items-center justify-center">
            <Shield className="text-[#F8B400]" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black">DevOps Control Center</h1>
            <p className="text-xs text-zinc-500">
              Superadmin step-up · OTP → 2FA → Device
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          Use your existing B2C admin superadmin session, then complete the
          private challenge. This route is never linked from product navigation.
        </p>
        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {devOtp && (
          <p className="mb-4 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            Dev OTP (non-production): <strong>{devOtp}</strong>
          </p>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={() => void start()}
          className="w-full rounded-xl bg-[#F8B400] text-zinc-950 font-bold py-3 hover:bg-[#ffc933] disabled:opacity-60"
        >
          {loading ? "Starting…" : "Start DevOps challenge"}
        </button>
        <a
          href={ROUTES.login}
          className="mt-4 block text-center text-xs text-zinc-500 hover:text-zinc-300"
        >
          Need a session? Sign in as B2C superadmin first
        </a>
      </div>
    </div>
  );
}
