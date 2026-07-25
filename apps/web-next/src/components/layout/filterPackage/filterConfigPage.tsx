"use client";

import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { filterConfig, buildEmptyFilterConfig, FilterState, SortOption } from "./constant";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { HorizontalFilterBar } from "./HorizontalFilterBar";
import { SortPopup } from "./SortPopup";
import { MobileFilterPanel } from "./MobileFilterPanel";

type FilterMode = "desktop" | "mobile" | "both";

interface FilterConfigPageProps {
  sort: SortOption;
  onSortChange: (val: SortOption) => void;
  onClear: () => void;
  mode?: FilterMode;
  packageMode?: 'packages' | 'activities' | 'all';
}

const FilterConfigPage: React.FC<FilterConfigPageProps> = ({ sort, onSortChange, onClear, mode = "both", packageMode = "all" }) => {
  const { control, watch, reset } = useFormContext<FilterState>();
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showSortPopup, setShowSortPopup] = useState(false);

  const watchedFilters = watch("filterConfig");

  const appliedByGroup = useMemo(() => {
    const map: Record<string, number> = {};
    Object.keys(filterConfig).forEach((group) => {
      map[group] = Object.values(watchedFilters?.[group] ?? {}).filter(Boolean).length;
    });
    return map;
  }, [watchedFilters]);

  const totalApplied = Object.values(appliedByGroup).reduce((a, b) => a + b, 0);

  const handleClear = () => {
    reset({ filterConfig: buildEmptyFilterConfig(), country: "Malaysia", city: "", search: "", sort: "default" } as FilterState);
    onClear();
  };

  return (
    <div className="select-none">
      {(mode === "desktop" || mode === "both") && (
        <div className="hidden md:block w-full">
          <HorizontalFilterBar control={control} appliedByGroup={appliedByGroup} packageMode={packageMode} />
        </div>
      )}

      {(mode === "mobile" || mode === "both") && (
        <div className="md:hidden flex items-center gap-2 px-3 py-2">
          <button onClick={() => setShowMobileFilter(true)} className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer">
            <SlidersHorizontal size={15} />
            FILTERS
            {totalApplied > 0 && <span className="bg-white text-primary text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{totalApplied}</span>}
          </button>

          <div className="relative">
            <button onClick={() => setShowSortPopup((v) => !v)} className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer">
              <ArrowUpDown size={15} />
              SORT
            </button>
            <AnimatePresence>
              {showSortPopup && <SortPopup value={sort} onChange={onSortChange} onClose={() => setShowSortPopup(false)} />}
            </AnimatePresence>
          </div>

          <button onClick={handleClear} className="ml-auto flex items-center gap-1 bg-[#FFE5E5] text-gray-700 text-[10px] font-bold px-4 py-2 rounded-md hover:bg-pink-100 transition-colors cursor-pointer uppercase tracking-widest">
            CLEAR FILTERS
          </button>
        </div>
      )}

      {(mode === "mobile" || mode === "both") && (
        <AnimatePresence>
          {showMobileFilter && (
            <MobileFilterPanel control={control} onClose={() => setShowMobileFilter(false)} handleClear={handleClear} appliedByGroup={appliedByGroup} packageMode={packageMode} />
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default FilterConfigPage;
