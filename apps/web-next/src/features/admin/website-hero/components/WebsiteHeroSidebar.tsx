import { Plus, Image as ImageIcon, Circle } from "lucide-react";
import { WebsiteHeroCard } from "../api/website-hero.api";

interface WebsiteHeroSidebarProps {
  heroes: WebsiteHeroCard[];
  selectedId: string | "__new__" | null;
  setSelectedId: (id: string | "__new__") => void;
}

export const WebsiteHeroSidebar = ({ heroes, selectedId, setSelectedId }: WebsiteHeroSidebarProps) => {
  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setSelectedId("__new__")}
          className={`w-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all ${
            selectedId === "__new__"
              ? "border-primary bg-primary/5 text-primary"
              : "border-neutral-200 hover:border-primary/40 hover:bg-neutral-50 text-neutral-500"
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${selectedId === "__new__" ? "bg-primary/20" : "bg-neutral-100"}`}>
            <Plus size={24} className={selectedId === "__new__" ? "text-primary" : "text-neutral-400"} />
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Create New Hero</span>
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm flex flex-col max-h-[600px]">
        <div className="p-5 border-b border-neutral-100 bg-neutral-50/50">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            Existing Configs ({heroes.length})
          </p>
        </div>
        <div className="overflow-y-auto p-3 space-y-2">
          {heroes.length > 0 ? heroes.map((h) => (
            <button
              key={h._id}
              type="button"
              onClick={() => setSelectedId(h._id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedId === h._id
                  ? "border-primary bg-white shadow-md shadow-primary/5 ring-1 ring-primary"
                  : "border-transparent hover:bg-neutral-50 text-neutral-600"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${selectedId === h._id ? "text-primary" : "text-neutral-800"}`}>
                    {h.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1 font-medium">
                    <ImageIcon size={12} />
                    <span>{h.backgroundImages?.length || 0} images</span>
                  </div>
                </div>
                <Circle className="text-neutral-300" size={18} />
              </div>
            </button>
          )) : <div className="p-6 text-neutral-500">No hero cards yet.</div>}
        </div>
      </div>
    </div>
  );
};
