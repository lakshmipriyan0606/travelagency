"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import { Unavailable } from "@/features/devops/format";

type Sec = {
  collectedAt?: string;
  failedDevopsAuth?: { available: boolean; count: number; note?: string };
  deniedActions?: { available: boolean; count: number };
  ipAllowlist?: {
    available: boolean;
    enabled: boolean;
    entryCount: number;
    status: string;
    reason?: string | null;
  };
  rateLimit?: {
    available: boolean;
    note?: string;
    persistedSignals?: boolean;
    reason?: string;
  };
  recentDenied?: Array<{
    ts: string;
    action: string;
    ip: string;
    result: string;
  }>;
  gaps?: Array<{ id: string; available: boolean; reason: string }>;
};

export default function DevopsSecurityPage() {
  const [data, setData] = useState<Sec | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void devopsApi
      .securitySummary()
      .then((res) => setData((res as { data: Sec }).data))
      .catch(() => setError("Failed to load security ops"));
  }, []);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <p className="text-zinc-500 text-sm">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="text-[#F8B400]" size={18} />
        <div>
          <h1 className="text-xl font-black">Security operations</h1>
          <p className="text-xs text-zinc-500">
            DevOps audit denials + allowlist status
            {data.collectedAt
              ? ` · ${new Date(data.collectedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          label="Failed / denied auth"
          value={data.failedDevopsAuth?.count}
        />
        <Kpi label="Denied actions" value={data.deniedActions?.count} />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            IP allowlist
          </p>
          <p className="mt-2 text-lg font-black text-zinc-50">
            {data.ipAllowlist?.enabled ? "Enabled" : "Disabled"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {data.ipAllowlist?.status}
            {data.ipAllowlist?.entryCount
              ? ` · ${data.ipAllowlist.entryCount} entries`
              : ""}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Rate limit telemetry
          </p>
          <p className="mt-2 text-lg font-black text-zinc-600">n/a</p>
          <Unavailable reason={data.rateLimit?.reason || data.rateLimit?.note} />
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Recent denied events
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-800">
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">IP</th>
                <th className="text-left p-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {(data.recentDenied || []).map((r, i) => (
                <tr key={i} className="border-b border-zinc-900 text-zinc-300">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(r.ts).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono">{r.action}</td>
                  <td className="p-3">{r.ip || "—"}</td>
                  <td className="p-3 text-red-300">{r.result}</td>
                </tr>
              ))}
              {!data.recentDenied?.length && (
                <tr>
                  <td colSpan={4} className="p-4 text-zinc-500">
                    No denied events in range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Not instrumented
        </h2>
        {(data.gaps || []).map((g) => (
          <div key={g.id}>
            <p className="text-sm text-zinc-300 uppercase">{g.id}</p>
            <Unavailable reason={g.reason} />
          </div>
        ))}
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-zinc-50">
        {value ?? "—"}
      </p>
    </div>
  );
}
