"use client";

import { useEffect, useState } from "react";
import { devopsApi } from "@/features/devops/api";

export default function DevopsHealthPage() {
  const [apps, setApps] = useState<Record<string, unknown> | null>(null);
  const [infra, setInfra] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void Promise.all([devopsApi.healthApps(), devopsApi.healthInfra()]).then(
      ([a, i]) => {
        setApps((a as { data: Record<string, unknown> }).data);
        setInfra((i as { data: Record<string, unknown> }).data);
      }
    );
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Application & infra health</h1>
      <pre className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-xs overflow-auto text-zinc-300">
        {JSON.stringify({ apps, infra }, null, 2)}
      </pre>
    </div>
  );
}
