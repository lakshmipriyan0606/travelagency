"use client";

/** Shared DevOps UI helpers — formatters & range presets. */

export function formatBytes(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (Math.abs(v) >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`;
}

export function formatPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n}%`;
}

export function healthColor(h?: string | null): string {
  if (h === "green") return "text-emerald-400";
  if (h === "yellow") return "text-amber-300";
  if (h === "red") return "text-red-400";
  return "text-zinc-500";
}

export function severityColor(s?: string | null): string {
  if (s === "critical") return "text-red-400";
  if (s === "warning") return "text-amber-300";
  if (s === "info") return "text-sky-400";
  return "text-zinc-400";
}

export type RangePreset = "15m" | "1h" | "today" | "7d" | "30d";

export function rangeFromPreset(preset: RangePreset): {
  from: string;
  to: string;
} {
  const to = new Date();
  const from = new Date(to);
  if (preset === "15m") from.setMinutes(from.getMinutes() - 15);
  else if (preset === "1h") from.setHours(from.getHours() - 1);
  else if (preset === "today") from.setHours(0, 0, 0, 0);
  else if (preset === "7d") from.setDate(from.getDate() - 7);
  else if (preset === "30d") from.setDate(from.getDate() - 30);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function formatUptime(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function Unavailable({ reason }: { reason?: string | null }) {
  return (
    <p className="text-xs text-zinc-500 italic">
      Unavailable{reason ? ` — ${reason}` : ""}
    </p>
  );
}
