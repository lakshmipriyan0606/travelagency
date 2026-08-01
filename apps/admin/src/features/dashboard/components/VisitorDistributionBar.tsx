import { Users } from "lucide-react";
import { VisitorData } from "../types";

interface VisitorDistributionBarProps {
  visitorStats: VisitorData[];
  totalVisitors: number;
}

export function VisitorDistributionBar({ visitorStats }: VisitorDistributionBarProps) {
  const recentWeek = visitorStats.slice(-7);
  const weekTotal = recentWeek.reduce((sum, v) => sum + v.count, 0);

  if (weekTotal === 0) return null;

  return (
    <div className="relative bg-[var(--ent-card,#16161b)] border border-white/[0.08] rounded-[20px] p-5 shadow-[0_8px_28px_rgba(0,0,0,0.45)] overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/30 before:to-transparent">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Users size={12} /> Visitor Trend (Last 7 Days)
        </p>
        <p className="text-xs text-zinc-500">{weekTotal} visitors this week</p>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
        {recentWeek.map((day) => (
          <div
            key={day._id}
            title={`${day._id}: ${day.count}`}
            style={{
              width: `${(day.count / weekTotal) * 100}%`,
              background: "#3b82f6",
              minWidth: day.count > 0 ? "4px" : "0",
              opacity: 0.4 + (day.count / Math.max(...recentWeek.map((d) => d.count), 1)) * 0.6,
            }}
            className="rounded-sm transition-all duration-500"
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {recentWeek.map((day) => (
          <div key={day._id} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-zinc-400">
              {day._id.slice(5)}{" "}
              <strong className="text-white">({day.count})</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
