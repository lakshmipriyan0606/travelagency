"use client";

import { useState } from "react";
import { ROUTES } from "@/lib/routes";
import { devopsApi } from "@/features/devops/api";

export default function DevopsOtpPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await devopsApi.otpVerify(code.trim());
      // Full navigation so middleware cookie presence gate sees devops_session.
      window.location.assign(ROUTES.devops.executive);
    } catch {
      setError("Invalid or expired OTP");
      setLoading(false);
    }
  }

  const digits = code.replace(/\D/g, "");
  const canSubmit = digits.length >= 4 && digits.length <= 5;

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-6">
      <form
        onSubmit={(e) => void submit(e)}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 space-y-4"
      >
        <h1 className="text-lg font-black">OTP verification</h1>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
          inputMode="numeric"
          maxLength={5}
          placeholder="OTP"
          autoComplete="one-time-code"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 tracking-[0.2em] text-center text-lg"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full rounded-xl bg-[#F8B400] text-zinc-950 font-bold py-3 disabled:opacity-60"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
}
