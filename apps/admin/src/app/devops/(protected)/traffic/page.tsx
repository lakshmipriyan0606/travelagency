"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import { Unavailable } from "@/features/devops/format";

type Traffic = {
  available?: boolean;
  reason?: string;
  collectedAt?: string;
  days?: number;
  purpose?: string;
  overview?: Record<string, unknown> | null;
  distribution?: {
    browsers?: Array<{ name?: string; count?: number; [k: string]: unknown }>;
    os?: Array<{ name?: string; count?: number; [k: string]: unknown }>;
    devices?: Array<{ name?: string; count?: number; [k: string]: unknown }>;
    countries?: Array<{ name?: string; count?: number; [k: string]: unknown }>;
  } | null;
  gaps?: string[];
};

function DistList({
  title,
  rows,
}: {
  title: string;
  rows?: Array<{ name?: string; count?: number; [k: string]: unknown }>;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">
        {title}
      </p>
      <ul className="space-y-1.5 text-sm">
        {(rows || []).slice(0, 12).map((r, i) => (
          <li
            key={`${String(r.name)}-${i}`}
            className="flex justify-between text-zinc-300"
          >
            <span className="truncate">
              {String(r.name || r.label || r._id || "—")}
            </span>
            <span className="text-[#F8B400]">
              {String(r.count ?? r.value ?? "—")}
            </span>
          </li>
        ))}
        {!rows?.length && (
          <li className="text-zinc-500 text-xs">No distribution data</li>
        )}
      </ul>
    </div>
  );
}

export default function DevopsTrafficPage() {
  const [data, setData] = useState<Traffic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void devopsApi
      .trafficSummary("30")
      .then((res) => setData((res as { data: Traffic }).data))
      .catch(() => setError("Failed to load traffic summary"));
  }, []);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <p className="text-zinc-500 text-sm">Loading…</p>;

  if (!data.available) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-black">Traffic (engineering)</h1>
        <Unavailable reason={data.reason} />
      </div>
    );
  }

  const ov = data.overview || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="text-[#F8B400]" size={18} />
        <div>
          <h1 className="text-xl font-black">Traffic (engineering)</h1>
          <p className="text-xs text-zinc-500 max-w-xl">
            {data.purpose ||
              "Read-only visitor analytics bridge — product Metrics UI stays agency-facing."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ov)
          .filter(([, v]) => typeof v === "number" || typeof v === "string")
          .slice(0, 8)
          .map(([key, value]) => (
            <div
              key={key}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {key}
              </p>
              <p className="mt-2 text-xl font-black text-zinc-50">
                {String(value)}
              </p>
            </div>
          ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <DistList title="Browsers" rows={data.distribution?.browsers} />
        <DistList title="OS" rows={data.distribution?.os} />
        <DistList title="Devices" rows={data.distribution?.devices} />
        <DistList title="Countries" rows={data.distribution?.countries} />
      </div>

      {(data.gaps || []).length > 0 && (
        <ul className="text-xs text-zinc-600 space-y-1 list-disc pl-4">
          {data.gaps!.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
