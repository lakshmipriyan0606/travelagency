"use client";

import { useId, useMemo, useState } from "react";
import { Crown, Loader2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@travelagency/ui";
import { RANK_OPTIONS } from "@/config/rankConfig";
import {
  CatalogItem,
  CatalogListConfig,
  TakenRank,
  getCatalogBestRank,
  getCatalogTitle,
  isCatalogActivityItem,
} from "./types";

type Props = {
  item: CatalogItem;
  config: CatalogListConfig;
  takenRanks: TakenRank[];
  busy?: boolean;
  /** Compact trigger for table rows; fuller trigger for cards. */
  variant?: "card" | "table";
  onSetRank: (bestRank: string | null) => void;
};

export function CatalogSetBestControl({
  item,
  config,
  takenRanks,
  busy = false,
  variant = "card",
  onSetRank,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const currentRank = getCatalogBestRank(item);
  const isActivity = isCatalogActivityItem(item, config.mode);

  const peerTaken = useMemo(() => {
    return takenRanks.filter((entry) => {
      const entryIsActivity = Boolean(entry.isActivity);
      if (entryIsActivity !== isActivity) return false;
      return String(entry.packageId) !== String(item._id);
    });
  }, [takenRanks, isActivity, item._id]);

  const takenByRank = useMemo(() => {
    const map = new Map<string, TakenRank>();
    for (const entry of peerTaken) {
      map.set(String(entry.rank), entry);
    }
    return map;
  }, [peerTaken]);

  const label = currentRank != null ? `Best #${currentRank}` : "Set Best";

  const chooseRank = (bestRank: string | null) => {
    onSetRank(bestRank);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={busy}
          aria-controls={panelId}
          className={
            variant === "card"
              ? `inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                  currentRank != null
                    ? "border-[#F8B400]/45 bg-[#F8B400]/15 text-[#F8B400] hover:bg-[#F8B400]/25"
                    : "border-white/[0.12] bg-white/[0.04] text-white/70 hover:border-[#F8B400]/35 hover:text-[#F8B400]"
                }`
              : `inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-all disabled:opacity-50 ${
                  currentRank != null
                    ? "border-[#F8B400]/40 bg-[#F8B400]/12 text-[#F8B400]"
                    : "border-transparent text-white/45 hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/20"
                }`
          }
          title={
            currentRank != null
              ? `Homepage best slot #${currentRank} — change or clear`
              : "Promote to homepage Best Packages / Best Activities"
          }
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Crown size={14} />}
          {label}
        </button>
      </PopoverTrigger>

      <PopoverContent
        id={panelId}
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        aria-label={`Set best rank for ${getCatalogTitle(item)}`}
        className="z-[80] w-[min(100vw-2rem,17.5rem)] rounded-xl border border-[#F8B400]/25 bg-[var(--ent-elevated,#16161b)] p-3 text-[var(--ent-text-main,#F4F4F5)] shadow-[0_16px_40px_rgba(0,0,0,0.65)] outline-none"
      >
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F8B400]/90">
              Homepage rank
            </p>
            <p className="mt-0.5 text-[11px] text-white/45 leading-snug">
              Slots 1–{RANK_OPTIONS.length} for{" "}
              {isActivity ? "best activities" : "best packages"}. Picking a taken slot
              replaces the other item.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-white/40 hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {RANK_OPTIONS.map((rank) => {
            const key = String(rank);
            const occupant = takenByRank.get(key);
            const selected = currentRank === rank;
            return (
              <button
                key={rank}
                type="button"
                disabled={busy}
                onClick={() => chooseRank(key)}
                title={
                  occupant
                    ? `Taken by ${occupant.packageName || "another item"} — select to replace`
                    : `Set rank ${rank}`
                }
                className={`relative flex h-10 flex-col items-center justify-center rounded-lg border text-sm font-bold tabular-nums transition-all disabled:opacity-50 ${
                  selected
                    ? "border-[#F8B400] bg-[#F8B400] text-black shadow-[0_0_14px_rgba(248,180,0,0.35)]"
                    : occupant
                      ? "border-[#F8B400]/20 bg-[#F8B400]/08 text-[#F8B400]/85 hover:border-[#F8B400]/50"
                      : "border-white/[0.1] bg-white/[0.03] text-white/75 hover:border-[#F8B400]/40 hover:text-[#F8B400]"
                }`}
              >
                {rank}
                {occupant && !selected && (
                  <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#F8B400]/80" />
                )}
              </button>
            );
          })}
        </div>

        {peerTaken.length > 0 && (
          <ul className="mt-2.5 max-h-24 space-y-1 overflow-y-auto border-t border-white/[0.06] pt-2">
            {peerTaken.map((entry) => (
              <li
                key={`${entry.packageId}-${entry.rank}`}
                className="truncate text-[10px] text-white/40"
                title={entry.packageName}
              >
                <span className="font-semibold text-[#F8B400]/75">#{entry.rank}</span>{" "}
                {entry.packageName || "Untitled"}
              </li>
            ))}
          </ul>
        )}

        {currentRank != null && (
          <button
            type="button"
            disabled={busy}
            onClick={() => chooseRank(null)}
            className="mt-2.5 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-white/55 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
          >
            Remove from best
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
