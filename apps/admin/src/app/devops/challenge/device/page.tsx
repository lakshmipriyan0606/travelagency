"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { devopsApi, getDevopsFingerprint } from "@/features/devops/api";

export default function DevopsDevicePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function trustAndEnter() {
    setLoading(true);
    setError(null);
    try {
      const fingerprint = getDevopsFingerprint();
      await devopsApi.deviceRegister(fingerprint, navigator.platform || "Device");
      await devopsApi.deviceVerify(fingerprint);
      await devopsApi.sessionIssue(fingerprint);
      router.replace(ROUTES.devops.executive);
    } catch {
      setError("Device validation failed. Complete OTP and 2FA first.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 space-y-4">
        <h1 className="text-lg font-black">Device validation</h1>
        <p className="text-sm text-zinc-400">
          This browser will be trusted for DevOps access (30 days). Fingerprint
          stays local; only a hash is stored.
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={() => void trustAndEnter()}
          className="w-full rounded-xl bg-[#F8B400] text-zinc-950 font-bold py-3 disabled:opacity-60"
        >
          {loading ? "Validating…" : "Trust device & enter control center"}
        </button>
      </div>
    </div>
  );
}
