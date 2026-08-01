"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBytes } from "@/features/devops/format";

const TOOLTIP_STYLE = {
  background: "#09090b",
  border: "1px solid #27272a",
  borderRadius: 8,
  fontSize: 12,
};

const APP_COLORS: Record<string, string> = {
  b2c: "#F8B400",
  b2b: "#38bdf8",
  admin: "#a1a1aa",
  backend: "#34d399",
  other: "#fb923c",
};

export function UsageMeter({
  pct,
  label,
  health,
}: {
  pct: number | null | undefined;
  label?: string;
  health?: string | null;
}) {
  if (pct == null || !Number.isFinite(pct)) return null;
  const clamped = Math.max(0, Math.min(100, pct));
  const fill =
    health === "red"
      ? "bg-red-400"
      : health === "yellow"
        ? "bg-amber-300"
        : clamped >= 80
          ? "bg-amber-300"
          : "bg-[#F8B400]";

  return (
    <div className="mt-3 space-y-1">
      {label ? (
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
          {label}
        </p>
      ) : null}
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${fill}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

type AppBarRow = {
  app: string;
  storage: number;
  data: number;
  docs: number;
};

export function AppStorageBarChart({ rows }: { rows: AppBarRow[] }) {
  const data = rows.filter((r) => r.storage > 0 || r.data > 0);
  if (!data.length) {
    return (
      <p className="text-xs text-zinc-500 italic py-6 text-center">
        No Mongo app storage to chart yet
      </p>
    );
  }

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke="#71717a"
            fontSize={10}
            tickFormatter={(v) => formatBytes(Number(v))}
          />
          <YAxis
            type="category"
            dataKey="app"
            stroke="#71717a"
            fontSize={11}
            width={64}
            tickFormatter={(v) => String(v).toUpperCase()}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => [
              formatBytes(Number(value)),
              name === "storage" ? "Storage" : "Data",
            ]}
            labelFormatter={(label) => String(label).toUpperCase()}
          />
          <Bar dataKey="storage" name="storage" radius={[0, 4, 4, 0]} barSize={14}>
            {data.map((d) => (
              <Cell
                key={d.app}
                fill={APP_COLORS[d.app] || "#F8B400"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type CollectionBarRow = {
  name: string;
  storage: number;
};

export function CollectionsBarChart({
  rows,
  topN = 10,
}: {
  rows: CollectionBarRow[];
  topN?: number;
}) {
  const data = rows
    .filter((r) => r.storage > 0)
    .slice(0, topN)
    .map((r) => ({
      ...r,
      short: r.name.length > 28 ? `${r.name.slice(0, 26)}…` : r.name,
    }));

  if (!data.length) {
    return (
      <p className="text-xs text-zinc-500 italic py-6 text-center">
        No collection sizes to chart
      </p>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke="#71717a"
            fontSize={10}
            tickFormatter={(v) => formatBytes(Number(v))}
          />
          <YAxis
            type="category"
            dataKey="short"
            stroke="#71717a"
            fontSize={10}
            width={120}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [formatBytes(Number(value)), "Storage"]}
            labelFormatter={(_, payload) => {
              const full = payload?.[0]?.payload as
                | { name?: string }
                | undefined;
              return full?.name || "";
            }}
          />
          <Bar
            dataKey="storage"
            fill="#F8B400"
            radius={[0, 4, 4, 0]}
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type ForecastPoint = {
  ts?: string;
  diskPct?: number | null;
  memPct?: number | null;
  mongoStorageSize?: number | null;
};

export function ForecastTrendChart({ series }: { series: ForecastPoint[] }) {
  const hasPct = series.some(
    (s) =>
      (s.diskPct != null && Number.isFinite(s.diskPct)) ||
      (s.memPct != null && Number.isFinite(s.memPct))
  );
  const hasMongo = series.some(
    (s) => s.mongoStorageSize != null && Number.isFinite(s.mongoStorageSize)
  );

  if (!hasPct && !hasMongo) return null;

  return (
    <div className="space-y-4">
      {hasPct ? (
        <div className="h-52">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
            Host disk &amp; RAM %
          </p>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={series}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                stroke="#71717a"
                fontSize={10}
                tickFormatter={(v) =>
                  v ? new Date(String(v)).toLocaleDateString() : ""
                }
                minTickGap={40}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={(v) =>
                  v ? new Date(String(v)).toLocaleString() : ""
                }
                formatter={(value, name) => [
                  value != null ? `${Number(value)}%` : "—",
                  name === "diskPct" ? "Disk" : "RAM",
                ]}
              />
              <Area
                type="monotone"
                dataKey="diskPct"
                name="diskPct"
                stroke="#F8B400"
                fill="#F8B40033"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="memPct"
                name="memPct"
                stroke="#38bdf8"
                fill="#38bdf833"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {hasMongo ? (
        <div className="h-44">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
            Mongo storage size (bytes over time)
          </p>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={series}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis
                dataKey="ts"
                stroke="#71717a"
                fontSize={10}
                tickFormatter={(v) =>
                  v ? new Date(String(v)).toLocaleDateString() : ""
                }
                minTickGap={40}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickFormatter={(v) => formatBytes(Number(v))}
                width={56}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={(v) =>
                  v ? new Date(String(v)).toLocaleString() : ""
                }
                formatter={(value) => [
                  formatBytes(value == null ? null : Number(value)),
                  "Mongo storage",
                ]}
              />
              <Area
                type="monotone"
                dataKey="mongoStorageSize"
                name="mongoStorageSize"
                stroke="#34d399"
                fill="#34d39933"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}

export function SectionError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400/90 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2">
      {message}
    </p>
  );
}

export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-zinc-800/80"
          style={{ width: `${70 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
