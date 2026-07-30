import { Plus, Image as ImageIcon, Check } from "lucide-react";
import { WebsiteHeroCard } from "../api/website-hero.api";

interface WebsiteHeroSidebarProps {
  heroes: WebsiteHeroCard[];
  selectedId: string | "__new__" | null;
  setSelectedId: (id: string | "__new__") => void;
}

export const WebsiteHeroSidebar = ({ heroes, selectedId, setSelectedId }: WebsiteHeroSidebarProps) => {
  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="admin-surface p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setSelectedId("__new__")}
          className={`w-full flex flex-col items-center justify-center p-6 rounded-xl border border-dashed transition-all duration-200 ${
            selectedId === "__new__"
              ? "border-[#F8B400]/50 bg-[#F8B400]/10 text-[#F8B400] shadow-[0_0_24px_rgba(248,180,0,0.08)]"
              : "border-white/[0.12] text-white/45 hover:border-[#F8B400]/35 hover:bg-white/[0.03] hover:text-white/70"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 border transition-colors ${
              selectedId === "__new__"
                ? "bg-[#F8B400]/15 border-[#F8B400]/30 text-[#F8B400]"
                : "bg-white/[0.04] border-white/[0.08] text-white/40"
            }`}
          >
            <Plus size={22} />
          </div>
          <span className="font-semibold uppercase tracking-[0.18em] text-[11px]">Create New Hero</span>
        </button>
      </div>

      <div className="admin-surface overflow-hidden flex flex-col max-h-[600px]">
        <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Existing Configs
            <span className="ml-1.5 tabular-nums text-white/30">({heroes.length})</span>
          </p>
        </div>
        <div className="overflow-y-auto p-3 space-y-1.5">
          {heroes.length > 0 ? (
            heroes.map((h) => {
              const selected = selectedId === h._id;
              const thumb = h.backgroundImages?.[0]?.url;
              return (
                <button
                  key={h._id}
                  type="button"
                  onClick={() => setSelectedId(h._id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                    selected
                      ? "border-[#F8B400]/45 bg-[#F8B400]/10 shadow-[0_0_20px_rgba(248,180,0,0.08)]"
                      : "border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-lg overflow-hidden shrink-0 border ${
                        selected ? "border-[#F8B400]/35" : "border-white/[0.08]"
                      } bg-white/[0.04]`}
                    >
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/25">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm truncate tracking-tight ${
                          selected ? "text-[#F8B400]" : "text-white/85 group-hover:text-white"
                        }`}
                      >
                        {h.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/40 mt-0.5 font-medium">
                        <ImageIcon size={11} className="shrink-0" />
                        <span>{h.backgroundImages?.length || 0} images</span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        selected
                          ? "bg-[#F8B400] text-black"
                          : "border border-white/20 text-transparent"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-white/45">No hero configs yet.</p>
              <p className="text-xs text-white/30 mt-1">Create one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
