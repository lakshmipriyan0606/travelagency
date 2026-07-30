import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  className?: string;
}

export function SectionHeader({ icon: Icon, title, className = "mb-3" }: SectionHeaderProps) {
  return (
    <p className={`text-xs font-black uppercase tracking-widest text-[#F8B400] flex items-center gap-2.5 ${className}`}>
      <span className="ent-gold-bar h-4" />
      <Icon size={13} className="text-[#F8B400]" /> {title}
    </p>
  );
}
