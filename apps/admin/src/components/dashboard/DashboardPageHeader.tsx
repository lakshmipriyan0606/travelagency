import { LucideIcon, RefreshCw } from "lucide-react";
import { cn } from "@travelagency/utils";

interface DashboardPageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  lastRefresh?: Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function DashboardPageHeader({
  icon: Icon,
  title,
  subtitle,
  lastRefresh,
  isRefreshing,
  onRefresh,
}: DashboardPageHeaderProps) {
  return (
    <div className="relative flex items-start justify-between gap-4 flex-wrap bg-[var(--ent-card,#16161b)] border border-white/[0.08] p-6 rounded-[20px] shadow-[0_8px_28px_rgba(0,0,0,0.45)] overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent">
      <div className="min-w-0">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <span className="ent-gold-bar h-8 shrink-0" />
          <Icon className="text-[#F8B400] shrink-0" size={26} />
          <span className="truncate">{title}</span>
        </h1>
        <p className="text-xs text-zinc-400 font-medium mt-1.5 ml-[15px]">{subtitle}</p>
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            "flex items-center gap-2.5 h-11 px-4 rounded-xl border text-xs font-bold transition-all duration-200",
            "border-[#F8B400]/25 bg-[#F8B400]/10 text-[#F8B400]",
            "hover:bg-[#F8B400]/18 hover:border-[#F8B400]/45 hover:shadow-[0_0_20px_rgba(248,180,0,0.15)]",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        >
          <RefreshCw
            size={14}
            className={cn(isRefreshing && "animate-spin")}
          />
          <span>Refresh</span>
          {lastRefresh && (
            <span className="text-[10px] font-semibold text-[#F8B400]/70 tabular-nums border-l border-[#F8B400]/25 pl-2.5">
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
