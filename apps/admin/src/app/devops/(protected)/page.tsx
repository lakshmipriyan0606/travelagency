"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Server,
  Users,
  Zap,
} from "lucide-react";
import { devopsApi } from "@/features/devops/api";

type Summary = {
  overallHealth: string;
  kpis: {
    todaysRequests: number;
    successRate: number;
    errorRate: number;
    avgResponseMs: number;
    openErrors: number;
    activeUsersApprox: number;
    criticalAlertCount: number;
    warningCount: number;
  };
  apps: Record<string, { status: string; requests: number; avgMs: number }>;
  infra: { mongo: string; redis: string; overall: string };
};

function HealthDot({ status }: { status: string }) {
  const color =
    status === "green" || status === "healthy" || status === "up"
      ? "bg-emerald-400"
      : status === "yellow" || status === "degraded"
        ? "bg-amber-400"
        : status === "unknown"
          ? "bg-zinc-500"
          : "bg-red-500";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
          {label}
        </p>
        <Icon size={16} className="text-[#F8B400]" />
      </div>
      <p className="mt-2 text-2xl font-black text-zinc-50">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function DevopsExecutivePage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await devopsApi.executive();
      setData((res as { data: Summary }).data);
      setError(null);
    } catch {
      setError("Failed to load executive summary");
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 30000);
    return () => clearInterval(t);
  }, [load]);

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }
  if (!data) {
    return <p className="text-zinc-500 text-sm">Loading executive overview…</p>;
  }

  const k = data.kpis;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-zinc-50">Executive overview</h1>
        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
          <HealthDot status={data.overallHealth} />
          System health: {data.overallHealth}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Today's requests" value={k.todaysRequests} icon={Activity} />
        <Kpi
          label="Success rate"
          value={`${k.successRate}%`}
          icon={CheckCircle2}
        />
        <Kpi label="Error rate" value={`${k.errorRate}%`} icon={AlertTriangle} />
        <Kpi
          label="Avg response"
          value={`${k.avgResponseMs} ms`}
          icon={Zap}
        />
        <Kpi label="Open errors" value={k.openErrors} icon={AlertTriangle} />
        <Kpi
          label="Visitors today"
          value={k.activeUsersApprox}
          sub="Approx unique"
          icon={Users}
        />
        <Kpi
          label="Critical"
          value={k.criticalAlertCount}
          icon={Server}
        />
        <Kpi label="Warnings" value={k.warningCount} icon={AlertTriangle} />
      </div>

      <div>
        <h2 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider">
          Application health (15m samples)
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(data.apps).map(([key, app]) => (
            <div
              key={key}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase">{key}</p>
                <HealthDot status={app.status} />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {app.requests} req · {app.avgMs} ms avg
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 flex flex-wrap gap-6 text-sm">
        <span className="flex items-center gap-2">
          <HealthDot status={data.infra.mongo} /> Mongo: {data.infra.mongo}
        </span>
        <span className="flex items-center gap-2">
          <HealthDot status={data.infra.redis} /> Redis: {data.infra.redis}
        </span>
      </div>
    </div>
  );
}
