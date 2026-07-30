"use client";

import { LayoutGrid, LayoutList } from "lucide-react";

export type ViewMode = "list" | "card";

type Props = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  /** Accessible name for the toggle group */
  label?: string;
};

export function ViewModeToggle({ value, onChange, label = "View mode" }: Props) {
  return (
    <div
      className="inline-flex rounded-lg border border-white/[0.1] bg-white/[0.03] p-0.5"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
          value === "list"
            ? "bg-[#F8B400] text-black shadow-[0_0_14px_rgba(248,180,0,0.25)]"
            : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
        }`}
        aria-pressed={value === "list"}
        title="List view"
      >
        <LayoutList size={15} />
        List
      </button>
      <button
        type="button"
        onClick={() => onChange("card")}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
          value === "card"
            ? "bg-[#F8B400] text-black shadow-[0_0_14px_rgba(248,180,0,0.25)]"
            : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
        }`}
        aria-pressed={value === "card"}
        title="Card view"
      >
        <LayoutGrid size={15} />
        Card
      </button>
    </div>
  );
}
