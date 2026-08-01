"use client";

import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import { formatUptime, Unavailable } from "@/features/devops/format";

type Deploy = {
  collectedAt?: string;
  runtime?: {
    available: boolean;
    nodeVersion?: string;
    platform?: string;
    arch?: string;
    pid?: number;
    uptimeSec?: number;
    env?: string;
  };
  package?: {
    available: boolean;
    version?: string | null;
    name?: string | null;
    reason?: string;
  };
  git?: {
    available: boolean;
    commit?: string | null;
    source?: string;
    reason?: string;
  };
  deployHistory?: { available: boolean; reason?: string; items?: unknown[] };
  pm2?: { available: boolean; reason?: string };
};

export default function DevopsDeployPage() {
  const [data, setData] = useState<Deploy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void devopsApi
      .deploySummary()
      .then((res) => setData((res as { data: Deploy }).data))
      .catch(() => setError("Failed to load deploy summary"));
  }, []);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <p className="text-zinc-500 text-sm">Loading…</p>;

  const r = data.runtime;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Rocket className="text-[#F8B400]" size={18} />
        <div>
          <h1 className="text-xl font-black">Deployment monitoring</h1>
          <p className="text-xs text-zinc-500">
            Live process identity only — no invented deploy history
            {data.collectedAt
              ? ` · ${new Date(data.collectedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card label="Node" value={r?.nodeVersion} />
        <Card label="Uptime" value={formatUptime(r?.uptimeSec)} />
        <Card label="PID" value={r?.pid != null ? String(r.pid) : "—"} />
        <Card label="Platform" value={`${r?.platform || "—"} / ${r?.arch || "—"}`} />
        <Card label="NODE_ENV" value={r?.env} />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Package
          </p>
          {data.package?.available ? (
            <>
              <p className="mt-2 text-xl font-black text-zinc-50">
                {data.package.version || "—"}
              </p>
              <p className="text-xs text-zinc-500">{data.package.name}</p>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-xl font-black text-zinc-600">n/a</p>
              <Unavailable reason={data.package?.reason} />
            </div>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Git commit
        </h2>
        {data.git?.available ? (
          <p className="font-mono text-sm text-zinc-200">
            {data.git.commit}{" "}
            <span className="text-zinc-500">({data.git.source})</span>
          </p>
        ) : (
          <Unavailable reason={data.git?.reason} />
        )}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Deploy history
        </h2>
        <Unavailable reason={data.deployHistory?.reason} />
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          PM2
        </h2>
        <Unavailable reason={data.pm2?.reason} />
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-zinc-50">{value || "—"}</p>
    </div>
  );
}
