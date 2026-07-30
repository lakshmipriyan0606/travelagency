import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PanelCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PanelCard({
  icon: Icon,
  iconClassName = "text-[#F8B400]",
  title,
  viewAllHref,
  viewAllLabel = "View All",
  badge,
  children,
  className = "",
}: PanelCardProps) {
  return (
    <div className={`relative bg-[var(--ent-card,#16161b)] border border-white/[0.08] rounded-[20px] shadow-[0_8px_28px_rgba(0,0,0,0.45)] overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/30 before:to-transparent ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/60">
        <div className="flex items-center gap-2.5">
          <span className="ent-gold-bar h-5" />
          <Icon size={18} className={iconClassName} />
          <h2 className="font-extrabold text-white text-sm">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {viewAllHref && (
            <Link href={viewAllHref} className="text-xs font-bold text-[#F8B400] hover:text-[#FFD54A] transition-colors flex items-center gap-1">
              {viewAllLabel} <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
