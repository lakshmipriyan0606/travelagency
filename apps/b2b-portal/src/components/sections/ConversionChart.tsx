"use client";

import { DashboardCard } from "@/components/cards/DashboardCard";
import { Badge } from "@/components/ui/Badge";

export interface ConversionChartProps {
  rate?: number;
}

export function ConversionChart({ rate = 0 }: ConversionChartProps) {
  const clamped = Math.max(0, Math.min(100, rate));
  const WIDTH = 280;
  const HEIGHT = 120;
  const PADDING = 8;
  // Simple spark from 0 → rate for visual presence (single real metric)
  const points = [0, clamped * 0.35, clamped * 0.55, clamped * 0.7, clamped * 0.85, clamped].map(
    (value, i, arr) => {
      const x = PADDING + (i / (arr.length - 1)) * (WIDTH - PADDING * 2);
      const y = HEIGHT - PADDING - (value / 100) * (HEIGHT - PADDING * 2);
      return { x, y, value };
    }
  );
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT} L ${points[0].x} ${HEIGHT} Z`;

  return (
    <DashboardCard className="h-full relative">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Quote Conversion Rate</h2>
        <p className="text-xs text-zinc-500 mt-1">Accepted quotes vs non-draft requests</p>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Quote conversion rate"
      >
        <defs>
          <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8B400" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F8B400" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#conversionGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="#F8B400"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={4}
          fill="#FFD54A"
          stroke="#F8B400"
          strokeWidth="2"
        />
      </svg>

      <div className="absolute bottom-6 right-6">
        <Badge variant="gold" className="text-sm px-3 py-1.5 normal-case tracking-normal font-black">
          {clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}% Conversion Rate
        </Badge>
      </div>
    </DashboardCard>
  );
}
