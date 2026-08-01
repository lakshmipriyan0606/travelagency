"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { devopsApi } from "@/features/devops/api";
import {
  rangeFromPreset,
  type RangePreset,
  Unavailable,
} from "@/features/devops/format";

type Obs = {
  available?: boolean;
  reason?: string | null;
  sampledNote?: string;
  range?: { from: string; to: string };
  kpis?: {
    requests: number;
    rps: number;
    rpm: number;
    avgMs: number | null;
    maxMs: number | null;
    error4xx: number;
    error5xx: number;
    errorRatePct: number | null;
  };
  series?: Array<{
    minute: string;
    requests: number;
    errors: number;
    avgMs: number;
    p95Ms: number | null;
  }>;
  topSlow?: Array<{
    method: string;
    route: string;
    count: number;
    avgMs: number;
    p95Ms: number | null;
    p99Ms: number | null;
  }>;
  topFailed?: Array<{
    method: string;
    route: string;
    count: number;
    errors: number;
    error5xx: number;
    avgMs: number;
  }>;
  topUsed?: Array<{
    method: string;
    route: string;
    count: number;
    source: string;
  }>;
};

const PRESETS: RangePreset[] = ["15m", "1h", "today", "7d", "30d"];

export default function DevopsApiPage() {
  const [preset, setPreset] = useState<RangePreset>("1h");
  const [obs, setObs] = useState<Obs | null>(null);
  const [requests, setRequests] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const range = rangeFromPreset(preset);
    try {
      const [o, r] = await Promise.all([
        devopsApi.apiObservability(range),
        devopsApi.apiRequests({ ...range, limit: "40" }),
      ]);
      setObs((o as { data: Obs }).data);
      setRequests(
        ((r as { data: { items: Array<Record<string, unknown>> } }).data
          ?.items || []) as Array<Record<string, unknown>>
      );
    } catch {
      setError("Failed to load API observability");
    }
  }, [preset]);

  useEffect(() => {
    void load();
  }, [load]);

  const k = obs?.kpis;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">API observability</h1>
          <p className="text-xs text-zinc-500 mt-1">
            {obs?.sampledNote ||
              "Rollups from sampled devops_request_logs + ApiHit for public totals"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={`text-[11px] px-2.5 py-1 rounded-md border ${
                preset === p
                  ? "border-[#F8B400]/60 text-[#F8B400] bg-[#F8B400]/10"
                  : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {!obs?.available && (
        <Unavailable reason={obs?.reason || "Waiting for rollup samples"} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Requests", value: k?.requests ?? "—" },
          { label: "RPS", value: k?.rps ?? "—" },
          { label: "Avg ms", value: k?.avgMs ?? "—" },
          {
            label: "Error rate",
            value: k?.errorRatePct != null ? `${k.errorRatePct}%` : "—",
          },
          { label: "4xx", value: k?.error4xx ?? "—" },
          { label: "5xx", value: k?.error5xx ?? "—" },
          { label: "Max ms", value: k?.maxMs ?? "—" },
          { label: "RPM", value: k?.rpm ?? "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-black text-zinc-50">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 h-64">
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">
          Requests / minute (rollup)
        </p>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={obs?.series || []}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="minute" hide />
            <YAxis stroke="#71717a" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "#09090b",
                border: "1px solid #27272a",
              }}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#F8B400"
              fill="#F8B40033"
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="#f87171"
              fill="#f8717133"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <EndpointTable
          title="Top slow (p95)"
          rows={(obs?.topSlow || []).map((r) => ({
            key: `${r.method}-${r.route}`,
            left: `${r.method} ${r.route}`,
            right: `${r.p95Ms ?? r.avgMs} ms`,
            sub: `avg ${r.avgMs} · n=${r.count}`,
          }))}
        />
        <EndpointTable
          title="Top failed"
          rows={(obs?.topFailed || []).map((r) => ({
            key: `${r.method}-${r.route}`,
            left: `${r.method} ${r.route}`,
            right: `${r.errors} err`,
            sub: `5xx ${r.error5xx} · n=${r.count}`,
          }))}
        />
        <EndpointTable
          title="Top used (ApiHit)"
          rows={(obs?.topUsed || []).map((r) => ({
            key: `${r.method}-${r.route}`,
            left: `${r.method} ${r.route}`,
            right: String(r.count),
            sub: r.source,
          }))}
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Recent sampled requests
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-800">
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Method</th>
                <th className="text-left p-3">Route</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">ms</th>
                <th className="text-left p-3">App</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={i} className="border-b border-zinc-900 text-zinc-300">
                  <td className="p-3 whitespace-nowrap">
                    {r.ts ? new Date(String(r.ts)).toLocaleString() : "—"}
                  </td>
                  <td className="p-3">{String(r.method)}</td>
                  <td className="p-3 font-mono max-w-[280px] truncate">
                    {String(r.route)}
                  </td>
                  <td className="p-3">{String(r.status)}</td>
                  <td className="p-3">{String(r.durationMs)}</td>
                  <td className="p-3">{String(r.app)}</td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan={6} className="p-4 text-zinc-500">
                    No samples in range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EndpointTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ key: string; left: string; right: string; sub?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">
        {title}
      </p>
      <ul className="space-y-2 text-sm">
        {rows.slice(0, 12).map((r) => (
          <li key={r.key} className="flex justify-between gap-2 text-zinc-300">
            <div className="min-w-0">
              <p className="truncate font-mono text-xs">{r.left}</p>
              {r.sub && (
                <p className="text-[10px] text-zinc-600">{r.sub}</p>
              )}
            </div>
            <span className="text-amber-300 shrink-0 text-xs">{r.right}</span>
          </li>
        ))}
        {!rows.length && (
          <li className="text-zinc-500 text-xs">No data in range</li>
        )}
      </ul>
    </div>
  );
}
