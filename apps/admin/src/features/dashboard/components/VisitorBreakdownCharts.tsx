"use client";

import type { ComponentType } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Monitor, Globe2, AppWindow, Cpu } from "lucide-react";
import { VisitorDistribution } from "../types";
import { PanelCard, EmptyState } from "@/components/dashboard";

const COLORS = ["#F8B400", "#3b82f6", "#a855f7", "#22c55e", "#f97316", "#06b6d4", "#e11d48", "#84cc16"];

interface VisitorBreakdownChartsProps {
  distribution: VisitorDistribution | null;
  loading?: boolean;
}

function MiniTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  return (
    <div className="bg-[#16161b]/95 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-lg text-xs">
      <p className="text-white font-bold">{row.name}</p>
      <p className="text-zinc-400">{row.value} visitors</p>
    </div>
  );
}

function DonutBlock({
  title,
  icon: Icon,
  data,
}: {
  title: string;
  icon: ComponentType<{ size?: number }>;
  data: { name: string; count: number }[];
}) {
  const chartData = data.map((d) => ({ name: d.name || "Unknown", value: d.count }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2 mb-3">
        <Icon size={12} /> {title}
      </p>
      {total === 0 ? (
        <p className="text-xs text-zinc-600 py-8 text-center">No data yet</p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="h-[120px] w-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={32}
                  outerRadius={52}
                  paddingAngle={2}
                  stroke="transparent"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<MiniTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 space-y-1.5 min-w-0">
            {chartData.slice(0, 5).map((d, i) => (
              <li key={d.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="text-zinc-400 truncate flex-1">{d.name}</span>
                <span className="text-white font-bold tabular-nums">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function VisitorBreakdownCharts({ distribution, loading }: VisitorBreakdownChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-white/[0.04] animate-pulse border border-white/10" />
        ))}
      </div>
    );
  }

  if (!distribution) {
    return (
      <PanelCard icon={Globe2} title="Visitor Distribution">
        <EmptyState
          icon={Globe2}
          title="Distribution unavailable"
          description="Enrichment fields appear after the upgraded tracker records visits."
        />
      </PanelCard>
    );
  }

  const hasAny =
    distribution.deviceType.some((d) => d.count > 0) ||
    distribution.browser.some((d) => d.count > 0) ||
    distribution.os.some((d) => d.count > 0) ||
    distribution.country.some((d) => d.count > 0 && d.name && d.name !== "Unknown");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <DonutBlock title="Device" icon={Monitor} data={distribution.deviceType} />
        <DonutBlock title="Browser" icon={AppWindow} data={distribution.browser} />
        <DonutBlock title="OS" icon={Cpu} data={distribution.os} />
        <DonutBlock title="Country" icon={Globe2} data={distribution.country} />
      </div>

      {hasAny && distribution.country.filter((c) => c.name && c.name !== "Unknown").length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-3">
            Top countries
          </p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distribution.country
                  .filter((c) => c.name && c.name !== "Unknown")
                  .slice(0, 8)}
                layout="vertical"
                margin={{ left: 8, right: 12, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={70}
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "#16161b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="count" fill="#F8B400" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
