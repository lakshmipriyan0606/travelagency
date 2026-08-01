import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: string;
  sub?: string;
  trend?: number | null;
  onClick?: () => void;
}

function formatTrend(trend: number) {
  const sign = trend > 0 ? "+" : "";
  return `${sign}${trend}%`;
}

export function StatCard({ label, value, icon: Icon, accent, sub, trend, onClick }: StatCardProps) {
  const trendColor =
    trend == null
      ? ""
      : trend > 0
        ? "text-emerald-400"
        : trend < 0
          ? "text-rose-400"
          : "text-zinc-500";

  return (
    <div
      onClick={onClick}
      title={sub}
      className={`relative bg-[var(--ent-card,#16161b)] border border-white/[0.08] rounded-[20px] p-5 shadow-[0_8px_28px_rgba(0,0,0,0.45)] flex items-start justify-between gap-4 overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/35 before:to-transparent hover:border-white/[0.12] ${
        onClick ? "cursor-pointer hover:border-[#F8B400]/35 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)]" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
        <p className="text-3xl font-black text-white mt-1.5 leading-none truncate">{value}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {sub && <p className="text-xs text-zinc-500 font-medium">{sub}</p>}
          {trend != null && Number.isFinite(trend) && (
            <span className={`text-[11px] font-bold ${trendColor}`}>{formatTrend(trend)}</span>
          )}
        </div>
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(248,180,0,0.12)]"
        style={{ background: accent + "18", border: `1px solid ${accent}40` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
    </div>
  );
}
