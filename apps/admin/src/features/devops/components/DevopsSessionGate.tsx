"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { DevopsShell } from "@/features/devops/components/DevopsShell";
import { devopsApi } from "@/features/devops/api";

type SessionProbe = { data?: { active?: boolean } };

/**
 * Client validation after cookie presence gate.
 * Invalid / expired / inactive session → enterprise 404 (never soft-redirect to login).
 */
export function DevopsSessionGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ok" | "gone">("loading");

  useEffect(() => {
    let cancelled = false;
    void devopsApi
      .session()
      .then((res) => {
        if (cancelled) return;
        if ((res as SessionProbe)?.data?.active) setStatus("ok");
        else setStatus("gone");
      })
      .catch(() => {
        if (!cancelled) setStatus("gone");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "gone") {
    notFound();
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#07080c] text-zinc-400 flex items-center justify-center text-sm">
        Validating DevOps session…
      </div>
    );
  }

  return <DevopsShell>{children}</DevopsShell>;
}
