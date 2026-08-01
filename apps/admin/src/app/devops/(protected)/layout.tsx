"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DevopsShell } from "@/features/devops/components/DevopsShell";
import { devopsApi } from "@/features/devops/api";
import { ROUTES } from "@/lib/routes";

export default function DevopsProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void devopsApi
      .session()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace(ROUTES.devops.login);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#07080c] text-zinc-400 flex items-center justify-center text-sm">
        Validating DevOps session…
      </div>
    );
  }

  return <DevopsShell>{children}</DevopsShell>;
}
