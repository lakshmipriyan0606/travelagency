"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import { severityColor } from "@/features/devops/format";

type AlertItem = {
  fingerprint: string;
  severity: string;
  source: string;
  title: string;
  cause: string;
  impact: string;
  action: string;
  eta?: string | null;
  status: string;
  resource?: string;
  ackable?: boolean;
  ephemeral?: boolean;
  lastSeenAt?: string;
};

type AlertsPayload = {
  collectedAt?: string;
  summary?: {
    critical: number;
    warning: number;
    open: number;
    ack: number;
    total: number;
  };
  items?: AlertItem[];
  notes?: string[];
};

export default function DevopsAlertsPage() {
  const [filter, setFilter] = useState("open");
  const [data, setData] = useState<AlertsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await devopsApi.alerts(filter);
      setData((res as { data: AlertsPayload }).data);
    } catch {
      setError("Failed to load alert center");
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(fp: string, status: string) {
    await devopsApi.patchAlert(fp, status);
    await load();
  }

  const s = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="text-[#F8B400]" size={18} />
          <div>
            <h1 className="text-xl font-black">Alert center</h1>
            <p className="text-xs text-zinc-500">
              Capacity alerts + open critical errors
              {data?.collectedAt
                ? ` · ${new Date(data.collectedAt).toLocaleString()}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {["open", "ack", "resolved", "all"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-[11px] px-2.5 py-1 rounded-md border ${
                filter === f
                  ? "border-[#F8B400]/60 text-[#F8B400]"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Sum label="Critical" value={s?.critical} className="text-red-400" />
        <Sum label="Warning" value={s?.warning} className="text-amber-300" />
        <Sum label="Open" value={s?.open} />
        <Sum label="Acked" value={s?.ack} />
      </div>

      <div className="space-y-3">
        {(data?.items || []).map((a) => (
          <div
            key={a.fingerprint}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold uppercase ${severityColor(a.severity)}`}>
                  {a.severity} · {a.source}
                  {a.resource ? ` · ${a.resource}` : ""} · {a.status}
                </p>
                <p className="font-semibold text-zinc-100 mt-1">{a.title}</p>
                <p className="text-xs text-zinc-400 mt-2">
                  <span className="text-zinc-500">Cause:</span> {a.cause}
                </p>
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-500">Impact:</span> {a.impact}
                </p>
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-500">Action:</span> {a.action}
                  {a.eta ? ` · ETA: ${a.eta}` : ""}
                </p>
                <p className="text-[10px] font-mono text-zinc-600 mt-1 truncate">
                  {a.fingerprint}
                  {a.ephemeral ? " · ephemeral until ack" : ""}
                </p>
              </div>
              {a.ackable && a.status !== "resolved" && (
                <div className="flex gap-2">
                  {a.status === "open" && (
                    <button
                      type="button"
                      onClick={() => void setStatus(a.fingerprint, "ack")}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-amber-500/50"
                    >
                      Ack
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void setStatus(a.fingerprint, "resolved")}
                    className="text-xs px-3 py-1.5 rounded-lg border border-emerald-700/50 text-emerald-300"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {!data?.items?.length && (
          <p className="text-sm text-zinc-500">No alerts for this filter.</p>
        )}
      </div>

      {(data?.notes || []).length > 0 && (
        <ul className="text-xs text-zinc-600 space-y-1 list-disc pl-4">
          {data!.notes!.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sum({
  label,
  value,
  className,
}: {
  label: string;
  value?: number;
  className?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${className || "text-zinc-50"}`}>
        {value ?? 0}
      </p>
    </div>
  );
}
