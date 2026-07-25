export const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-3 justify-center pt-4">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
      <Icon size={18} />
    </div>
    <div>
      <h3 className="text-[15px] font-bold text-neutral-800 tracking-tight leading-none">{title}</h3>
      {subtitle && <p className="text-[9px] text-neutral-400 mt-1 font-medium italic">{subtitle}</p>}
    </div>
  </div>
);

export const StyledField = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-2 rounded-lg hover:bg-neutral-50/10 transition-all group ${className}`}>
    {children}
  </div>
);
