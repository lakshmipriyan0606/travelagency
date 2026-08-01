"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { devopsApi } from "@/features/devops/api";

type AuditItem = {
  ts: string;
  action: string;
  module: string;
  result: string;
  actorUserId?: string | null;
  ip?: string;
  deviceId?: string;
  meta?: Record<string, unknown>;
};

export default function DevopsAuditPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [result, setResult] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await devopsApi.auditLogs({
        result: result === "all" ? undefined : result,
        limit: "150",
      });
      setItems(
        ((res as { data: { items?: AuditItem[] } }).data?.items ||
          []) as AuditItem[]
      );
    } catch {
      setError("Failed to load audit trail");
    }
  }, [result]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-[#F8B400]" size={18} />
          <div>
            <h1 className="text-xl font-black">Audit trail</h1>
            <p className="text-xs text-zinc-500">devops_audit_logs</p>
          </div>
        </div>
        <div className="flex gap-1">
          {["all", "ok", "denied", "error"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setResult(r)}
              className={`text-[11px] px-2.5 py-1 rounded-md border ${
                result === r
                  ? "border-[#F8B400]/60 text-[#F8B400]"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-800">
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Result</th>
                <th className="text-left p-3">IP</th>
                <th className="text-left p-3">Actor</th>
                <th className="text-left p-3">Meta</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={i} className="border-b border-zinc-900 text-zinc-300">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(r.ts).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono">{r.action}</td>
                  <td
                    className={`p-3 ${
                      r.result === "denied"
                        ? "text-red-300"
                        : r.result === "error"
                          ? "text-amber-300"
                          : "text-emerald-300"
                    }`}
                  >
                    {r.result}
                  </td>
                  <td className="p-3">{r.ip || "—"}</td>
                  <td className="p-3 font-mono truncate max-w-[100px]">
                    {r.actorUserId ? String(r.actorUserId) : "—"}
                  </td>
                  <td className="p-3 font-mono truncate max-w-[200px] text-zinc-500">
                    {r.meta ? JSON.stringify(r.meta).slice(0, 80) : "—"}
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={6} className="p-4 text-zinc-500">
                    No audit rows
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
