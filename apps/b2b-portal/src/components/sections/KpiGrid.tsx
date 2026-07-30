"use client";

import type { DashboardKPIs } from "@/features/dashboard/types/dashboard.types";
import { KPI_DISPLAY } from "@/features/dashboard/config/dashboard-ui.config";
import { KpiCard } from "@/components/cards/KpiCard";

export interface KpiGridProps {
  kpis: DashboardKPIs;
}

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {KPI_DISPLAY.map((config, index) => (
        <KpiCard
          key={config.key}
          label={config.label}
          value={kpis[config.key]}
          icon={config.icon}
          iconColor={config.iconColor}
          sparkColor={config.sparkColor}
          trend={config.trend}
          trendUp={config.trendUp}
          sparkline={config.sparkline}
          index={index}
        />
      ))}
    </div>
  );
}
