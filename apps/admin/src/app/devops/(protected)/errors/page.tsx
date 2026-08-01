"use client";

import { useEffect, useState } from "react";
import { devopsApi } from "@/features/devops/api";

type Err = {
  fingerprint: string;
  message: string;
  count: number;
  status: string;
  lastSeenAt: string;
  app: string;
  source: string;
};

export default function DevopsErrorsPage() {
  const [items, setItems] = useState<Err[]>([]);

  async function load() {
    const res = await devopsApi.errors("open");
    setItems(((res as { data: Err[] }).data || []) as Err[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(fp: string, status: string) {
    await devopsApi.patchError(fp, status);
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Error intelligence</h1>
      <div className="space-y-3">
        {items.map((e) => (
          <div
            key={e.fingerprint}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-100">{e.message}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {e.app} · {e.source} · ×{e.count} ·{" "}
                  {new Date(e.lastSeenAt).toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-zinc-600 mt-1">
                  {e.fingerprint}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void setStatus(e.fingerprint, "ack")}
                  className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-amber-500/50"
                >
                  Ack
                </button>
                <button
                  type="button"
                  onClick={() => void setStatus(e.fingerprint, "resolved")}
                  className="text-xs px-3 py-1.5 rounded-lg border border-emerald-700/50 text-emerald-300"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && (
          <p className="text-sm text-zinc-500">No open errors in inbox.</p>
        )}
      </div>
    </div>
  );
}
