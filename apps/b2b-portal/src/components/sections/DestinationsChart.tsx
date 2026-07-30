"use client";

import { DashboardCard } from "@/components/cards/DashboardCard";

export interface DestinationStat {
  name: string;
  value: number;
  count?: number;
  color: string;
}

export interface DestinationsChartProps {
  data?: readonly DestinationStat[];
  totalRequests?: number;
}

const CENTER = 100;
const RADIUS = 70;
const INNER_RADIUS = 48;

function polarToCartesian(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function describeArc(startAngle: number, endAngle: number, outerR: number, innerR: number) {
  const startOuter = polarToCartesian(startAngle, outerR);
  const endOuter = polarToCartesian(endAngle, outerR);
  const startInner = polarToCartesian(endAngle, innerR);
  const endInner = polarToCartesian(startAngle, innerR);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

export function DestinationsChart({ data = [], totalRequests = 0 }: DestinationsChartProps) {
  const totalPct = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let currentAngle = 0;

  const segments = data.map((item) => {
    const sweep = (item.value / totalPct) * 360;
    const start = currentAngle;
    const end = currentAngle + sweep;
    currentAngle = end;
    return { ...item, start, end };
  });

  return (
    <DashboardCard className="h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Top Destinations</h2>
        <p className="text-xs text-zinc-500 mt-1">Most requested travel destinations</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[180px] text-xs text-zinc-500">
          No destination data yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <svg viewBox="0 0 200 200" className="w-44 h-44" role="img" aria-label="Top destinations donut chart">
              {segments.map((seg) => (
                <path
                  key={seg.name}
                  d={describeArc(seg.start, seg.end - 0.5, RADIUS, INNER_RADIUS)}
                  fill={seg.color}
                  opacity={0.9}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-zinc-500 font-medium">Total Requests</span>
              <span className="text-xl font-black text-white">
                {totalRequests.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <ul className="flex-1 w-full space-y-2.5" role="list">
            {data.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  <span className="text-sm text-zinc-300 truncate">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">
                  {item.value}%
                  {typeof item.count === "number" ? (
                    <span className="text-zinc-500 font-normal ml-1">({item.count})</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
}
