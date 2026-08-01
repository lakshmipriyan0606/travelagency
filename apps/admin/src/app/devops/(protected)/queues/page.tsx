"use client";

import { useEffect, useState } from "react";
import { Workflow } from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import { Unavailable } from "@/features/devops/format";

type Queues = {
  collectedAt?: string;
  agenda?: {
    available: boolean;
    reason?: string | null;
    workerStarted?: boolean;
    workerStartedAt?: string | null;
    mongoConnected?: boolean;
    collection?: string;
    totals?: { total: number; withFailureHistory: number };
    jobs?: Array<{
      name: string;
      total: number | null;
      withFailureHistory: number | null;
    }>;
    recentFailures?: Array<Record<string, unknown>>;
  };
  bullmq?: { available: boolean; reason?: string };
};

export default function DevopsQueuesPage() {
  const [data, setData] = useState<Queues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void devopsApi
      .queuesSummary()
      .then((res) => setData((res as { data: Queues }).data))
      .catch(() => setError("Failed to load queue monitoring"));
  }, []);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <p className="text-zinc-500 text-sm">Loading…</p>;

  const a = data.agenda;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Workflow className="text-[#F8B400]" size={18} />
        <div>
          <h1 className="text-xl font-black">Queue monitoring</h1>
          <p className="text-xs text-zinc-500">
            Agenda via getQueueHealthDetail
            {data.collectedAt
              ? ` · ${new Date(data.collectedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Agenda
          </p>
          {a?.available ? (
            <p className="mt-2 text-lg font-black text-emerald-400">Connected</p>
          ) : (
            <div className="mt-2">
              <p className="text-lg font-black text-zinc-600">n/a</p>
              <Unavailable reason={a?.reason} />
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Worker
          </p>
          <p className="mt-2 text-lg font-black text-zinc-50">
            {a?.workerStarted ? "Started" : "Stopped"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Job docs
          </p>
          <p className="mt-2 text-2xl font-black text-zinc-50">
            {a?.totals?.total ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            With failures
          </p>
          <p className="mt-2 text-2xl font-black text-amber-300">
            {a?.totals?.withFailureHistory ?? "—"}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Agenda jobs ({a?.collection || "agendaJobs"})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-800">
                <th className="text-left p-3">Name</th>
                <th className="text-right p-3">Total</th>
                <th className="text-right p-3">Failure history</th>
              </tr>
            </thead>
            <tbody>
              {(a?.jobs || []).map((j) => (
                <tr key={j.name} className="border-b border-zinc-900 text-zinc-300">
                  <td className="p-3 font-mono">{j.name}</td>
                  <td className="p-3 text-right">{j.total ?? "—"}</td>
                  <td className="p-3 text-right">
                    {j.withFailureHistory ?? "—"}
                  </td>
                </tr>
              ))}
              {!a?.jobs?.length && (
                <tr>
                  <td colSpan={3} className="p-4 text-zinc-500">
                    No job stats
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
          BullMQ
        </h2>
        <Unavailable reason={data.bullmq?.reason} />
      </section>
    </div>
  );
}
