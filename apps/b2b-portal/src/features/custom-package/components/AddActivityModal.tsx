"use client";

import { useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import { useMasterPackages } from "../hooks/useProposals";
import type { ActivitySlot, MasterPackage } from "../types/proposal.types";
import { activityAmountFromPackage, formatMoney } from "./composerShared";

type AddActivityModalProps = {
  open: boolean;
  cityId: string;
  cityName: string;
  dayNum: number;
  slot: ActivitySlot;
  /** Package ids already used in this slot (prevent duplicates). */
  excludePackageIds?: string[];
  onClose: () => void;
  onSelect: (pkg: MasterPackage, amount: number) => void;
};

export function AddActivityModal({
  open,
  cityId,
  cityName,
  dayNum,
  slot,
  excludePackageIds = [],
  onClose,
  onSelect,
}: AddActivityModalProps) {
  const { data: packages = [], isLoading, isError } = useMasterPackages(cityId);
  const [q, setQ] = useState("");

  const exclude = useMemo(
    () => new Set(excludePackageIds),
    [excludePackageIds]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return packages.filter((p) => {
      if (exclude.has(p._id)) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term)
      );
    });
  }, [packages, exclude, q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-16 sm:pt-20 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Add activity from packages"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121216] shadow-2xl overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#F8B400]">
              Add Activity
            </p>
            <h3 className="text-base font-semibold text-white mt-0.5">
              Day {dayNum} · {slot} · {cityName}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Pick a B2B package for this city. Amount uses activity addon, or
              base price if addon is 0.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search packages…"
            className={cn(
              "w-full h-11 rounded-xl border border-white/[0.12] bg-[var(--ent-elevated,#1c1c22)]",
              "px-3 text-sm text-white placeholder:text-zinc-500 outline-none",
              "focus:border-[#F8B400] focus:ring-[3px] focus:ring-[#F8B400]/22"
            )}
          />

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-zinc-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading packages…
            </div>
          ) : isError ? (
            <p className="text-sm text-red-400 py-6 text-center">
              Could not load packages for this city.
            </p>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-zinc-400">
                No packages available for {cityName}.
              </p>
              <p className="text-xs text-zinc-600">
                Ask admin to add a B2B package for this city (with activity addon
                or base price).
              </p>
            </div>
          ) : (
            <ul className="max-h-[50vh] overflow-y-auto space-y-2 ent-scrollbar">
              {filtered.map((pkg) => {
                const amount = activityAmountFromPackage(pkg);
                return (
                  <li
                    key={pkg._id}
                    className="rounded-xl border border-white/[0.08] bg-black/25 p-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {pkg.name}
                      </p>
                      {pkg.description ? (
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">
                          {pkg.description}
                        </p>
                      ) : null}
                      <p className="text-[11px] text-[#F8B400] mt-1 font-medium">
                        +{formatMoney(amount, pkg.currency || "USD")}
                        {Number(pkg.amounts?.activityAddon) > 0
                          ? " · activity addon"
                          : " · base price"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="shrink-0 bg-[#F8B400] text-black hover:bg-[#FFD54A] font-semibold"
                      disabled={amount <= 0}
                      title={
                        amount <= 0
                          ? "Package has no activity addon or base price"
                          : undefined
                      }
                      onClick={() => onSelect(pkg, amount)}
                    >
                      Select
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
