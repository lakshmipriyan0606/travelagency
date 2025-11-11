"use client";

import React, { useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { filterConfig } from "./constant";
import PrimaryButton from "@/components/Button/PrimaryButton";

type FilterConfigForm = {
    filterConfig: {
        [group: string]: {
            [value: string]: boolean;
        };
    };
};

type Props = {
    onApply?: (filters: FilterConfigForm["filterConfig"]) => void;
};

const buildEmptyFilters = (): FilterConfigForm["filterConfig"] => {
    const obj: FilterConfigForm["filterConfig"] = {};
    Object.keys(filterConfig).forEach((group) => {
        obj[group] = {};
        filterConfig[group as keyof typeof filterConfig]?.forEach((val: string) => {
            obj[group][val] = false;
        });
    });
    return obj;
};

const LaptopFilterRender: React.FC<{ control: any; watchFilters: any }> = ({
    control,
}) => {
    return (
        <div className="rounded-lg bg-white shadow-sm font-roboto text-sm hidden md:block p-2 xl:p-9">
            {Object.entries(filterConfig).map(([group, values]) => {
                return (
                    <div key={group} className="pb-4">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-base capitalize text-gray-700">
                                {group.replace(/([A-Z])/g, " $1")}
                            </h3>
                        </div>
                        {values.map((value: string) => {
                            const id = `${group}-${value}`;
                            return (
                                <motion.label
                                    key={value}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-3 mb-2 cursor-pointer select-none"
                                >
                                    <Controller
                                        name={`filterConfig.${group}.${value}`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                id={id}
                                                type="checkbox"
                                                checked={field.value || false}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                className="cursor-pointer w-4 h-4 accent-amber-500"
                                            />
                                        )}
                                    />
                                    <span className="text-gray-700">{value}</span>
                                </motion.label>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

const FilterConfigPage: React.FC<Props> = ({ onApply }) => {
    const { control, watch, reset } = useFormContext<FilterConfigForm>();
    const [activeType, setActiveType] = useState<string>(Object.keys(filterConfig)[0] || "");

    const watchedFilters = watch("filterConfig") || useMemo(() => buildEmptyFilters(), []);

    const totalApplied = useMemo(() => {
        if (!watchedFilters) return 0;
        return Object.values(watchedFilters)
            .flatMap((g) => Object.values(g))
            .filter(Boolean).length;
    }, [watchedFilters]);

    const appliedByGroup = useMemo(() => {
        const map: Record<string, number> = {};
        Object.keys(filterConfig).forEach((group) => {
            map[group] = Object.values(watchedFilters?.[group] || {}).filter(Boolean).length;
        });
        return map;
    }, [watchedFilters]);

    const handleClear = () => {
        reset({ filterConfig: buildEmptyFilters() } as any);
    };

    const handleApply = () => {
        const currentFilters = watchedFilters;
        onApply?.(currentFilters);
    };

    return (
        <section className="font-roboto select-none">
            {/* Desktop View */}
            <div className="hidden md:block">
                <LaptopFilterRender control={control} watchFilters={watchedFilters} />
            </div>

            {/* Mobile View */}
            <div className="md:hidden rounded-lg overflow-hidden bg-white p-6">
                <div className="flex">
                    {/* Left: Category Tabs */}
                    <div className="w-1/2 bg-white">
                        {Object.keys(filterConfig).map((group) => (
                            <button
                                key={group}
                                onClick={() => setActiveType(group)}
                                className={`relative w-full text-left p-3 text-sm capitalize transition flex items-center justify-between ${activeType === group
                                        ? "font-semibold text-amber-600"
                                        : "text-gray-600"
                                    } cursor-pointer`}
                            >
                                <span>{group.replace(/([A-Z])/g, " $1")}</span>
                                <span className="text-xs text-gray-400">
                                    {appliedByGroup[group] > 0 ? appliedByGroup[group] : ""}
                                </span>
                                {activeType === group && (
                                    <motion.span
                                        layoutId="mobile-highlight"
                                        className="absolute left-0 top-0 w-1 h-full bg-amber-500 rounded-r"
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right: Values List */}
                    <div className="w-1/2 p-2 flex flex-col gap-2 mt-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeType}
                                initial={{ opacity: 0.2, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.12 }}
                            >
                                {filterConfig[activeType as keyof typeof filterConfig]?.map((value: string) => {
                                    const id = `${activeType}-${value}`;
                                    return (
                                        <div key={value}>
                                            <div className="w-full h-[1px] bg-gray-200" />
                                            <div className="flex justify-between items-center py-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Controller
                                                        name={`filterConfig.${activeType}.${value}`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <input
                                                                id={id}
                                                                type="checkbox"
                                                                checked={field.value || false}
                                                                onChange={(e) => field.onChange(e.target.checked)}
                                                                className="cursor-pointer w-4 h-4 accent-amber-500"
                                                            />
                                                        )}
                                                    />
                                                    <label
                                                        htmlFor={id}
                                                        className="text-gray-700 cursor-pointer"
                                                    >
                                                        {value}
                                                    </label>
                                                </div>
                                                <div className="text-xs text-gray-400">(24)</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 flex items-center justify-between gap-3">
                    <PrimaryButton
                        buttonText="Clear Filter"
                        onClick={handleClear}
                        type="button"
                        className="flex-1 px-3 py-2 rounded border border-gray-200 bg-gray-500/4 text-custom-black text-sm"
                    />
                    <PrimaryButton
                        buttonText={`Apply ${totalApplied > 0 ? `(${totalApplied})` : ""}`}
                        onClick={handleApply}
                        type="button"
                        className="flex-1 px-3 py-2 rounded bg-amber-500 text-custom-black font-medium text-sm"
                    />
                </div>
            </div>
        </section>
    );
};

export default FilterConfigPage;