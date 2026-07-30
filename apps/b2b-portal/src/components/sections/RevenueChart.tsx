"use client";

import { useState } from "react";
import { DashboardCard } from "@/components/cards/DashboardCard";

export interface MonthlyVolumePoint {
  month: string;
  year: number;
  value: number;
}

export interface RevenueChartProps {
  data?: readonly MonthlyVolumePoint[];
}

const CHART_HEIGHT = 160;
const BAR_WIDTH = 28;
const GAP = 12;

export function RevenueChart({ data = [] }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const totalWidth = Math.max(data.length * (BAR_WIDTH + GAP) - GAP, BAR_WIDTH);
  const hasData = data.some((d) => d.value > 0);

  return (
    <DashboardCard className="h-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Quote Volume</h2>
          <p className="text-xs text-zinc-500 mt-1">Quotes submitted per month</p>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-[180px] text-xs text-zinc-500">
          No quote volume yet for this period.
        </div>
      ) : (
        <div className="relative">
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div
              className="absolute -top-1 z-10 px-3 py-2 rounded-xl bg-[#1C1C20] border border-white/[0.1] shadow-lg pointer-events-none transition-all duration-200"
              style={{
                left: `${((hoveredIndex * (BAR_WIDTH + GAP) + BAR_WIDTH / 2) / totalWidth) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <p className="text-[10px] text-zinc-500 font-medium">
                {data[hoveredIndex].month} {data[hoveredIndex].year}
              </p>
              <p className="text-sm font-bold text-[#F8B400]">
                {data[hoveredIndex].value} quote{data[hoveredIndex].value === 1 ? "" : "s"}
              </p>
            </div>
          )}

          <svg
            viewBox={`0 0 ${totalWidth} ${CHART_HEIGHT + 24}`}
            className="w-full h-auto"
            role="img"
            aria-label="Quote volume by month"
          >
            {data.map((item, i) => {
              const barHeight = Math.max((item.value / maxValue) * CHART_HEIGHT, item.value > 0 ? 4 : 0);
              const x = i * (BAR_WIDTH + GAP);
              const y = CHART_HEIGHT - barHeight;
              const isHovered = hoveredIndex === i;

              return (
                <g key={`${item.month}-${item.year}`}>
                  <rect
                    x={x}
                    y={0}
                    width={BAR_WIDTH}
                    height={CHART_HEIGHT}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  />
                  <rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={barHeight}
                    rx={6}
                    fill={isHovered ? "#FFD54A" : "#F8B400"}
                    opacity={item.value === 0 ? 0.15 : isHovered ? 1 : 0.85}
                    className="transition-all duration-200"
                  />
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={CHART_HEIGHT + 18}
                    textAnchor="middle"
                    className="fill-zinc-500 text-[10px] font-medium"
                  >
                    {item.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </DashboardCard>
  );
}
