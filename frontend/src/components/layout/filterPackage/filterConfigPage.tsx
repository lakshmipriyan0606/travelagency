"use client";

import React, { useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { filterConfig, buildEmptyFilterConfig, SORT_OPTIONS, FilterState, SortOption } from "./constant";
import { SlidersHorizontal, ArrowUpDown, X, ChevronDown, ChevronUp } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Horizontal Filter Bar (Desktop)
// ─────────────────────────────────────────────────────────────────────────────

interface HorizontalFilterProps {
    control: any;
    appliedByGroup: Record<string, number>;
    packageMode?: string;
}

const HorizontalFilterBar: React.FC<HorizontalFilterProps> = ({
    control,
    appliedByGroup,
    packageMode = "all"
}) => {
    const [activeGroup, setActiveGroup] = useState<string | null>(null);

    const toggleGroup = (group: string) => {
        if (activeGroup === group) {
            setActiveGroup(null);
        } else {
            setActiveGroup(group);
        }
    };

    return (
        <div className="hidden md:flex flex-col w-full bg-[#EAEAEA] mb-6 rounded-md overflow-hidden">
            {/* Filter Bar Row */}
            <div className="flex items-center gap-4 flex-wrap px-4 xl:px-8 py-2">
                {Object.entries(filterConfig)
                    .filter(([group]) => {
                        if (packageMode === 'packages' && group === 'activities') return false;
                        return true;
                    })
                    .map(([group]) => {
                    const count = appliedByGroup[group] ?? 0;
                    const isActive = activeGroup === group;

                    return (
                        <button
                            key={group}
                            onClick={() => toggleGroup(group)}
                            className={`flex items-center gap-2 px-2 py-2.5 text-xs xl:text-[13px] tracking-widest uppercase transition-colors relative cursor-pointer
                                ${isActive ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"}
                            `}
                        >
                            {count > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                            )}
                            <span>{group.replace(/([A-Z])/g, " $1").trim()}</span>
                            {isActive ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>
                    );
                })}
            </div>

            {/* Inline Expansion Panel */}
            <AnimatePresence>
                {activeGroup && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden bg-[#EAEAEA]"
                    >
                        <div className="px-4 xl:px-8 pb-6 pt-2 w-full flex flex-wrap gap-4">
                            {(filterConfig[activeGroup as keyof typeof filterConfig] as readonly string[]).map((value) => {
                                return (
                                    <Controller
                                        key={value}
                                        name={`filterConfig.${activeGroup}.${value}`}
                                        control={control}
                                        render={({ field }) => {
                                            const isSelected = field.value || false;
                                            return (
                                                <button
                                                    onClick={() => field.onChange(!isSelected)}
                                                    className={`px-6 py-2.5 rounded-full text-xs xl:text-sm tracking-widest uppercase transition-all shadow-sm border cursor-pointer
                                                        ${isSelected 
                                                            ? "bg-primary text-white border-primary" 
                                                            : "bg-white text-primary border-primary hover:bg-orange-50"}
                                                    `}
                                                >
                                                    {value}
                                                </button>
                                            )
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Sort Popup
// ─────────────────────────────────────────────────────────────────────────────

interface SortPopupProps {
    value: SortOption;
    onChange: (val: SortOption) => void;
    onClose: () => void;
}

const SortPopup: React.FC<SortPopupProps> = ({ value, onChange, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 min-w-[200px] overflow-hidden"
        >
            {SORT_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => { onChange(opt.value); onClose(); }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm text-left transition-colors cursor-pointer
                        ${value === opt.value
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <span className="w-4 text-center text-base">{opt.icon}</span>
                    {opt.label}
                </button>
            ))}
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Filter Slide Panel
// ─────────────────────────────────────────────────────────────────────────────

interface MobilePanelProps {
    control: any;
    onClose: () => void;
    handleClear: () => void;
    appliedByGroup: Record<string, number>;
    packageMode?: string;
}

const MobileFilterPanel: React.FC<MobilePanelProps> = ({
    control,
    onClose,
    handleClear,
    appliedByGroup,
    packageMode = "all"
}) => {
    const filteredConfigKeys = useMemo(() => {
        return Object.keys(filterConfig).filter(group => {
            if (packageMode === 'packages' && group === 'activities') return false;
            return true;
        });
    }, [packageMode]);

    const [activeTab, setActiveTab] = useState<string>(filteredConfigKeys[0]);

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                className="fixed right-0 top-0 h-full w-[85vw] max-w-[360px] z-50 bg-white flex flex-col shadow-2xl"
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-800">Filters</span>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* Two-column layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Category Tabs */}
                    <div className="w-[42%] bg-gray-50 border-r border-gray-100 overflow-y-auto">
                        {filteredConfigKeys.map((group) => (
                            <button
                                key={group}
                                onClick={() => setActiveTab(group)}
                                className={`relative w-full text-left px-3 py-4 text-sm capitalize transition-colors flex items-center justify-between cursor-pointer
                                    ${activeTab === group
                                        ? "font-semibold text-primary bg-white"
                                        : "text-gray-600 hover:bg-white/60"
                                    }`}
                            >
                                <span className="leading-snug">
                                    {group.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                {(appliedByGroup[group] ?? 0) > 0 && (
                                    <span className="text-[10px] bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center font-bold ml-1 flex-shrink-0">
                                        {appliedByGroup[group]}
                                    </span>
                                )}
                                {activeTab === group && (
                                    <motion.span
                                        layoutId="mobile-tab-indicator"
                                        className="absolute left-0 top-0 w-0.5 h-full bg-primary rounded-r"
                                        transition={{ type: "spring", stiffness: 250, damping: 24 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right: Values */}
                    <div className="flex-1 overflow-y-auto p-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.12 }}
                                className="flex flex-col gap-1"
                            >
                                {(filterConfig[activeTab as keyof typeof filterConfig] as readonly string[])?.map(
                                    (value) => {
                                        const id = `mobile-${activeTab}-${value}`;
                                        return (
                                            <div key={value} className="border-b border-gray-100 last:border-0">
                                                <div className="flex items-center justify-between py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Controller
                                                            name={`filterConfig.${activeTab}.${value}`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <input
                                                                    id={id}
                                                                    type="checkbox"
                                                                    checked={field.value || false}
                                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                                    className="cursor-pointer w-4 h-4 accent-primary"
                                                                />
                                                            )}
                                                        />
                                                        <label
                                                            htmlFor={id}
                                                            className="text-sm text-gray-700 cursor-pointer"
                                                        >
                                                            {value}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-3 flex gap-3">
                    <button
                        onClick={handleClear}
                        className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                        Apply
                    </button>
                </div>
            </motion.div>
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main FilterConfigPage
// ─────────────────────────────────────────────────────────────────────────────

type FilterMode = "desktop" | "mobile" | "both";

interface FilterConfigPageProps {
    sort: SortOption;
    onSortChange: (val: SortOption) => void;
    onClear: () => void;
    /** desktop = sidebar only | mobile = buttons only | both = all (default) */
    mode?: FilterMode;
    packageMode?: 'packages' | 'activities' | 'all';
}

const FilterConfigPage: React.FC<FilterConfigPageProps> = ({
    sort,
    onSortChange,
    onClear,
    mode = "both",
    packageMode = "all"
}) => {
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
            {/* ─── DESKTOP SIDEBAR ─── */}
            {(mode === "desktop" || mode === "both") && (
                <div className="hidden md:block w-full">
                    <HorizontalFilterBar
                        control={control}
                        appliedByGroup={appliedByGroup}
                        packageMode={packageMode}
                    />
                </div>
            )}

            {/* ─── MOBILE BUTTONS ─── */}
            {(mode === "mobile" || mode === "both") && (
                <div className="md:hidden flex items-center gap-2 px-3 py-2">
                    {/* FILTERS button */}
                    <button
                        onClick={() => setShowMobileFilter(true)}
                        className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                    >
                        <SlidersHorizontal size={15} />
                        FILTERS
                        {totalApplied > 0 && (
                            <span className="bg-white text-primary text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {totalApplied}
                            </span>
                        )}
                    </button>

                    {/* SORT button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortPopup((v) => !v)}
                            className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                        >
                            <ArrowUpDown size={15} />
                            SORT
                        </button>
                        <AnimatePresence>
                            {showSortPopup && (
                                <SortPopup
                                    value={sort}
                                    onChange={onSortChange}
                                    onClose={() => setShowSortPopup(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* CLEAR FILTER button */}
                    <button
                        onClick={handleClear}
                        className="ml-auto flex items-center gap-1 bg-pink-100 text-pink-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-pink-200 transition-colors cursor-pointer"
                    >
                        CLEAR FILTER
                    </button>
                </div>
            )}

            {/* Mobile Panel (Should only render in mobile/both mode) */}
            {(mode === "mobile" || mode === "both") && (
                <AnimatePresence>
                    {showMobileFilter && (
                        <MobileFilterPanel
                            control={control}
                            onClose={() => setShowMobileFilter(false)}
                            handleClear={handleClear}
                            appliedByGroup={appliedByGroup}
                            packageMode={packageMode}
                        />
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default FilterConfigPage;