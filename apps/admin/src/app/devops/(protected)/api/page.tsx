"use client";

import { useEffect, useState } from "react";
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

type Perf = {
  slowApis: Array<{ method: string; route: string; avgMs: number; count: number }>;
  topApis: Array<{ method: string; route: string; count: number }>;
  series: Array<{ hour: string; requests: number; errors: number; avgMs: number }>;
};

export default function DevopsApiPage() {
  const [perf, setPerf] = useState<Perf | null>(null);
  const [requests, setRequests] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    void Promise.all([
      devopsApi.apiPerformance(),
      devopsApi.apiRequests({ limit: "40" }),
    ]).then(([p, r]) => {
      setPerf((p as { data: Perf }).data);
      setRequests(
        ((r as { data: { items: Array<Record<string, unknown>> } }).data
          ?.items || []) as Array<Record<string, unknown>>
      );
    });
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black">API monitoring</h1>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 h-64">
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">
          Requests / hour (sampled)
        </p>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={perf?.series || []}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="hour" hide />
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

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">
            Slow APIs
          </p>
          <ul className="space-y-2 text-sm">
            {(perf?.slowApis || []).slice(0, 10).map((r) => (
              <li
                key={`${r.method}-${r.route}`}
                className="flex justify-between gap-2 text-zinc-300"
              >
                <span className="truncate font-mono text-xs">
                  {r.method} {r.route}
                </span>
                <span className="text-amber-300 shrink-0">{r.avgMs} ms</span>
              </li>
            ))}
            {!perf?.slowApis?.length && (
              <li className="text-zinc-500 text-xs">No samples yet</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">
            Top APIs (ApiHit)
          </p>
          <ul className="space-y-2 text-sm">
            {(perf?.topApis || []).slice(0, 10).map((r) => (
              <li
                key={`${r.method}-${r.route}`}
                className="flex justify-between gap-2 text-zinc-300"
              >
                <span className="truncate font-mono text-xs">
                  {r.method} {r.route}
                </span>
                <span className="text-[#F8B400] shrink-0">{r.count}</span>
              </li>
            ))}
          </ul>
        </div>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
