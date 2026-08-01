"use client";

import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import { Unavailable } from "@/features/devops/format";

type Kpi = {
  available: boolean;
  label: string;
  value: number | null;
  reason?: string;
};

type Biz = {
  collectedAt?: string;
  kpis?: Kpi[];
  payments?: { available: boolean; reason?: string };
  notes?: string[];
};

export default function DevopsBusinessPage() {
  const [data, setData] = useState<Biz | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void devopsApi
      .businessSummary()
      .then((res) => setData((res as { data: Biz }).data))
      .catch(() => setError("Failed to load business monitoring"));
  }, []);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <p className="text-zinc-500 text-sm">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="text-[#F8B400]" size={18} />
        <div>
          <h1 className="text-xl font-black">Business monitoring</h1>
          <p className="text-xs text-zinc-500">
            Live Mongo counts
            {data.collectedAt
              ? ` · ${new Date(data.collectedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {(data.kpis || []).map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {k.label}
            </p>
            {k.available ? (
              <p className="mt-2 text-2xl font-black text-zinc-50">{k.value}</p>
            ) : (
              <div className="mt-2">
                <p className="text-2xl font-black text-zinc-600">n/a</p>
                <Unavailable reason={k.reason} />
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
          Payments / revenue
        </h2>
        <Unavailable reason={data.payments?.reason} />
      </section>

      {(data.notes || []).length > 0 && (
        <ul className="text-xs text-zinc-600 space-y-1 list-disc pl-4">
          {data.notes!.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
