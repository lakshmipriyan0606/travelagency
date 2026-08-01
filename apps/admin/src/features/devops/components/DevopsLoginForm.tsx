"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { ENDPOINTS } from "@/lib/endpoints";
import axiosClient from "@/lib/apiClient";
import { devopsApi } from "@/features/devops/api";

type SessionProbe = { data?: { active?: boolean } };

export function DevopsLoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [b2cOk, setB2cOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function probe() {
      try {
        // Confirm B2C cookie reaches the API via same-origin proxy
        await axiosClient.get(ENDPOINTS.client.auth.session);
        if (!cancelled) setB2cOk(true);
      } catch {
        if (!cancelled) {
          setB2cOk(false);
          setError(
            "No B2C superadmin session. Sign in first, then return here."
          );
        }
        return;
      }

      try {
        const res = await devopsApi.session();
        if (
          !cancelled &&
          (res as SessionProbe)?.data?.active
        ) {
          router.replace(ROUTES.devops.executive);
        }
      } catch {
        /* no devops session yet — expected */
      }
    }

    void probe();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      await devopsApi.bootstrap();
      router.push(ROUTES.devops.otp);
    } catch (e: unknown) {
      const status =
        typeof e === "object" &&
        e &&
        "response" in e &&
        (e as { response?: { status?: number } }).response?.status;
      const apiMsg =
        typeof e === "object" &&
        e &&
        "response" in e &&
        (e as { response?: { data?: { message?: string } } }).response?.data
          ?.message;

      if (status === 401) {
        setB2cOk(false);
        setError(
          apiMsg ||
            "Unauthorized: No Token — sign in as B2C superadmin, then retry."
        );
      } else {
        setError(
          apiMsg || "Bootstrap failed. Sign in as B2C superadmin first."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const b2cLoginHref = `${ROUTES.login}?next=${encodeURIComponent(pathname || ROUTES.devops.login())}`;

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#F8B400]/15 flex items-center justify-center">
            <Shield className="text-[#F8B400]" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black">DevOps Control Center</h1>
            {b2cOk === true && (
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                B2C session detected
              </p>
            )}
            {b2cOk === false && (
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-0.5">
                B2C session missing
              </p>
            )}
          </div>
        </div>
        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {b2cOk === false && (
          <Link
            href={b2cLoginHref}
            className="mb-4 block w-full rounded-xl border border-[#F8B400]/40 text-center font-bold py-3 text-[#F8B400] hover:bg-[#F8B400]/10"
          >
            Sign in as B2C superadmin
          </Link>
        )}
        <button
          type="button"
          disabled={loading || b2cOk === false}
          onClick={() => void start()}
          className="w-full rounded-xl bg-[#F8B400] text-zinc-950 font-bold py-3 hover:bg-[#ffc933] disabled:opacity-60"
        >
          {loading ? "Starting…" : "Start challenge"}
        </button>
      </div>
    </div>
  );
}
