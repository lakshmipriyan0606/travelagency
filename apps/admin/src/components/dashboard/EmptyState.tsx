import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = "py-12" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3">
        <Icon size={20} className="text-zinc-400" />
      </div>
      <p className="font-bold text-zinc-300 text-sm">{title}</p>
      {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
      {action}
    </div>
  );
}
