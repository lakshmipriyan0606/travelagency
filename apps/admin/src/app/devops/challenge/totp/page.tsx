"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { devopsApi } from "@/features/devops/api";

export default function DevopsTotpPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try setup if not enrolled — backend returns secret when allowed
    void devopsApi
      .totpSetup()
      .then((res) => {
        const data = (res as { data?: { secret?: string; otpauth?: string } })
          .data;
        if (data?.secret) setSecret(data.secret);
        if (data?.otpauth) setOtpauth(data.otpauth);
      })
      .catch(() => {
        // Already enrolled — just verify
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await devopsApi.totpVerify(token.trim());
      router.push(ROUTES.devops.device);
    } catch {
      setError("Invalid authenticator code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-6">
      <form
        onSubmit={(e) => void submit(e)}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 space-y-4"
      >
        <h1 className="text-lg font-black">Authenticator (2FA)</h1>
        {secret && (
          <div className="text-xs space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-amber-100/90">
            <p>Scan / add this secret in your authenticator app (first time):</p>
            <p className="font-mono break-all text-[#F8B400]">{secret}</p>
            {otpauth && (
              <p className="font-mono break-all text-zinc-500 text-[10px]">
                {otpauth}
              </p>
            )}
          </div>
        )}
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          inputMode="numeric"
          maxLength={8}
          placeholder="123456"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 tracking-[0.4em] text-center text-lg"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || token.length < 6}
          className="w-full rounded-xl bg-[#F8B400] text-zinc-950 font-bold py-3 disabled:opacity-60"
        >
          Verify 2FA
        </button>
      </form>
    </div>
  );
}
