"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Package, Plus } from "lucide-react";
import { CatalogListTable } from "./CatalogListTable";
import { CatalogListCards } from "./CatalogListCards";
import {
  CatalogItem,
  CatalogListConfig,
  PAGE_SIZE_OPTIONS,
  PageSize,
  isCatalogActivityItem,
} from "./types";
import { ViewMode, ViewModeToggle } from "@/components/common/ViewModeToggle";
import { useTakenRanks, useUpdatePackageRank } from "@/features/packages/api";

type Props = {
  items: CatalogItem[];
  config: CatalogListConfig;
};

export default function CatalogListClient({ items, config }: Props) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [localItems, setLocalItems] = useState(items);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: takenRanks = [] } = useTakenRanks(true);
  const updateRank = useUpdatePackageRank();

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const total = localItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return localItems.slice(start, start + pageSize);
  }, [localItems, currentPage, pageSize]);

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);
  const showPagination = total > pageSize;

  const handlePageSizeChange = (value: string) => {
    const next = Number(value) as PageSize;
    setPageSize(next);
    setPage(1);
  };

  const handleSetRank = (id: string, bestRank: string | null) => {
    setUpdatingId(id);
    updateRank.mutate(
      { id, bestRank },
      {
        onSuccess: () => {
          setLocalItems((prev) => {
            const clearedRank = bestRank == null || bestRank === "" || bestRank === "0";
            const target = prev.find((p) => p._id === id);
            const previousRank =
              target?.isBestPackage && target.bestRank != null && target.bestRank !== ""
                ? Number(target.bestRank)
                : null;
            const targetIsActivity = target
              ? isCatalogActivityItem(target, config.mode)
              : config.mode === "activities";

            return prev.map((item) => {
              if (item._id === id) {
                return {
                  ...item,
                  isBestPackage: !clearedRank,
                  bestRank: clearedRank ? null : Number(bestRank),
                };
              }
              if (clearedRank) return item;

              const itemIsActivity = isCatalogActivityItem(item, config.mode);
              if (itemIsActivity !== targetIsActivity) return item;
              if (String(item.bestRank) === String(bestRank) && item.isBestPackage) {
                // Mirror updateRank: swap ranks when current already had a slot
                if (previousRank != null && Number.isFinite(previousRank)) {
                  return { ...item, isBestPackage: true, bestRank: previousRank };
                }
                return { ...item, isBestPackage: false, bestRank: null };
              }
              return item;
            });
          });
          router.refresh();
        },
        onSettled: () => setUpdatingId(null),
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="ent-gold-bar h-7 shrink-0" />
            {config.title}
          </h1>
          <p className="text-sm text-white/60 mt-1.5 ml-[15px]">{config.subtitle}</p>
        </div>
        <Link
          href={config.createHref}
          className="inline-flex items-center gap-2 bg-[#F8B400] hover:bg-[#e0a200] text-black px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-[0_0_20px_rgba(248,180,0,0.15)]"
        >
          <Plus size={18} />
          {config.createLabel}
        </Link>
      </div>

      <div className="admin-surface p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <h3 className="text-sm font-semibold text-white/80 tracking-tight">
            {config.mode === "activities" ? "All Activities" : "All Packages"}
            <span className="ml-2 tabular-nums text-white/45 font-medium">({total})</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-white/50">
              <span className="uppercase tracking-wider font-semibold">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="admin-field px-3 py-2 text-sm text-white outline-none cursor-pointer min-w-[72px]"
                aria-label="Page size"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <Package className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-base font-semibold text-white/80">{config.emptyLabel}</h3>
            <p className="text-sm text-white/45 mt-1">
              Get started by creating your first{" "}
              {config.mode === "activities" ? "activity" : "package"}.
            </p>
          </div>
        ) : viewMode === "list" ? (
          <CatalogListTable
            items={pageItems}
            config={config}
            takenRanks={takenRanks}
            updatingId={updatingId}
            onSetRank={handleSetRank}
          />
        ) : (
          <CatalogListCards
            items={pageItems}
            config={config}
            takenRanks={takenRanks}
            updatingId={updatingId}
            onSetRank={handleSetRank}
          />
        )}

        {total > 0 && (
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p className="text-xs text-white/45 tabular-nums">
              Showing{" "}
              <span className="text-white/70 font-medium">
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of <span className="text-white/70 font-medium">{total}</span>
            </p>

            {showPagination && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-white/60 border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <span className="min-w-[88px] text-center text-xs font-semibold text-white/70 tabular-nums">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-white/60 border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
