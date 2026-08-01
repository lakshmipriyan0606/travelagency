import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  /** Short helper line under the title (e.g. to distinguish Quotes vs Custom Packages). */
  subtitle?: string;
  /** Accent for the gold bar / icon / title. Defaults to brand gold. */
  accent?: string;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  accent = "#F8B400",
  className = "mb-3",
}: SectionHeaderProps) {
  return (
    <div className={className}>
      <p
        className="text-xs font-black uppercase tracking-widest flex items-center gap-2.5"
        style={{ color: accent }}
      >
        <span className="ent-gold-bar h-4" style={{ background: accent }} />
        <Icon size={13} style={{ color: accent }} /> {title}
      </p>
      {subtitle ? (
        <p className="text-[11px] text-zinc-500 font-medium mt-1.5 ml-[22px] leading-snug max-w-2xl">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
