import { ArrowUp, ArrowDown, Pencil, Trash2, MapPin } from "lucide-react";
import { Destination } from "../validation/destination.schema";

interface Props {
  dest: Destination;
  index: number;
  totalLength: number;
  onMove: (id: string, direction: "up" | "down") => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DestinationCard({
  dest,
  index,
  totalLength,
  onMove,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="group relative bg-white border border-neutral-100 rounded-[32px] p-6 shadow-sm hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-500 overflow-hidden">
      <div className="absolute -top-4 -right-4 text-9xl font-black text-neutral-50 opacity-[0.4] pointer-events-none select-none">
        {dest.orderNumber}
      </div>

      <div className="flex gap-6 relative z-10">
        <div className="relative w-32 h-32 rounded-3xl overflow-hidden border border-neutral-100 shadow-inner shrink-0 scale-100 group-hover:scale-105 transition-transform duration-500">
          <img src={dest.url} alt={dest.alt} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 px-2 h-6 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-black flex items-center justify-center border border-white/20 shadow-lg">
            Slot #{dest.orderNumber}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-1">
            <h4 className="text-lg font-black text-neutral-800 tracking-tight leading-none truncate pr-4">
              {dest.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
              <MapPin size={12} className="text-primary/60" />
              <span className="italic">Navigates to: {dest.location || dest.Location || "None"}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-1.5 mt-4">
            <button
              onClick={() => onMove(dest._id!, "up")}
              disabled={index === 0}
              className="p-2.5 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-primary transition-all disabled:opacity-10 cursor-pointer shadow-sm border border-neutral-50 bg-white"
              title="Move Up"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => onMove(dest._id!, "down")}
              disabled={index === totalLength - 1}
              className="p-2.5 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-primary transition-all disabled:opacity-10 cursor-pointer shadow-sm border border-neutral-50 bg-white"
              title="Move Down"
            >
              <ArrowDown size={16} />
            </button>
            <div className="w-px h-5 bg-neutral-100 mx-1.5" />
            <button
              onClick={() => onEdit(dest._id!)}
              className="p-2.5 rounded-xl hover:bg-emerald-50 text-neutral-300 hover:text-emerald-500 transition-all cursor-pointer shadow-sm border border-neutral-50 bg-white"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(dest._id!)}
              className="p-2.5 rounded-xl hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-all cursor-pointer shadow-sm border border-neutral-50 bg-white"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
