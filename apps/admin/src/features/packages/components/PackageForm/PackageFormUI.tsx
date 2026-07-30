export const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-3.5 pb-1">
    <div className="ent-gold-bar h-10 shrink-0" />
    <div className="w-9 h-9 rounded-xl bg-[#F8B400]/12 flex items-center justify-center text-[#F8B400] border border-[#F8B400]/25 shadow-[0_0_14px_rgba(248,180,0,0.15)]">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <h3 className="text-[15px] font-bold text-white tracking-tight leading-none">{title}</h3>
      {subtitle && <p className="text-[11px] text-zinc-400 mt-1.5 font-medium">{subtitle}</p>}
    </div>
  </div>
);

export const StyledField = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`min-w-0 w-full ${className ?? ""}`}>
    {children}
  </div>
);
