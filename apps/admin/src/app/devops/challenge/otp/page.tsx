"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { devopsApi } from "@/features/devops/api";

export default function DevopsOtpPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await devopsApi.otpVerify(code.trim());
      router.push(ROUTES.devops.totp);
    } catch {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-6">
      <form
        onSubmit={(e) => void submit(e)}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 space-y-4"
      >
        <h1 className="text-lg font-black">OTP verification</h1>
        <p className="text-xs text-zinc-500">
          Enter the 6-digit code. In development it is logged by the backend /
          shown after bootstrap.
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 tracking-[0.4em] text-center text-lg"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-xl bg-[#F8B400] text-zinc-950 font-bold py-3 disabled:opacity-60"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
}
