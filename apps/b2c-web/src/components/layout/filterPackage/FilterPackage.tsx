"use client";
import { FormProvider } from "react-hook-form";
import { useMemo } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Breadcrumb, { BreadcrumbItem } from "@/components/common/Breadcrumb/Breadcrumb";
import FilterConfigPage from "./filterConfigPage";
import FilterSearchBar from "./FilterSearchBar";
import { MALAYSIA_CITIES } from "@/config/destinations";
import { FilterState } from "./constant";
import { usePackageFilter } from "./usePackageFilter";
import { SelectedFiltersRow } from "./SelectedFiltersRow";
import { PackageListResults } from "./PackageListResults";

const buildBreadcrumb = (filters: FilterState, mode: string): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: mode === 'activities' ? "All Activities" : "All Packages", href: mode === 'activities' ? "/activities" : "/allpackage" },
  ];
  const activeType = Object.entries(filters.filterConfig?.packageType ?? {}).find(([, v]) => v)?.[0];
  if (activeType) items.push({ label: activeType });
  return items;
};

interface FilterPackageProps {
  likePackageOnly?: boolean;
  mode?: 'packages' | 'activities' | 'all';
}

const FilterPackage = ({ likePackageOnly = false, mode = 'all' }: FilterPackageProps) => {
  const {
    packageList, setPackageList, cursor, hasMore, totalCount, activeTab, setActiveTab,
    searchInput, setSearchInput, sort, setSort, methods, filters, filteredPackages, groupedPackages,
    isLoading, isError, refetch, handleRemoveTag, handleClearAll, handleSearch, resetAndRefetch
  } = usePackageFilter({ likePackageOnly, mode });

  const { setValue } = methods;
  const breadcrumbItems = useMemo(() => buildBreadcrumb(filters, mode), [filters, mode]);

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-white">
        <div className="px-4 sm:px-8 xl:px-16 pt-28 pb-2 relative z-40">
          <Breadcrumb items={breadcrumbItems} className="mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-wide">
            SEARCH <span className="text-sm sm:text-base font-normal text-gray-400 tracking-widest ml-1">GET WHAT YOU WANT EXACTLY</span>
          </h2>
          <div className="mb-4 relative z-50">
            <FilterSearchBar country={filters.country} setCountry={(val) => setValue("country", val)} city={filters.city} setCity={(val) => setValue("city", val)} cities={MALAYSIA_CITIES} searchInput={searchInput} setSearchInput={setSearchInput} onSearch={handleSearch} packages={packageList} />
          </div>
          <FilterConfigPage sort={sort} onSortChange={(val) => { setSort(val); setValue("sort", val); }} onClear={handleClearAll} mode="mobile" packageMode={mode} />
        </div>

        <div className="flex flex-col gap-0 px-4 sm:px-8 xl:px-16 pb-10 mt-0">
          <div className="hidden md:block w-full z-30 mb-2 relative">
            <FilterConfigPage sort={sort} onSortChange={(val) => { setSort(val); setValue("sort", val); }} onClear={handleClearAll} mode="desktop" packageMode={mode} />
          </div>

          <div className="flex-1 w-full min-w-0">
            <div className="w-full">
              <SelectedFiltersRow filters={filters} onRemove={handleRemoveTag} onClearAll={handleClearAll} />
            </div>

            {likePackageOnly && (
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-2xl w-fit border border-neutral-200/50 shadow-inner">
                  <button onClick={() => setActiveTab('packages')} className={`relative px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'packages' ? "text-white" : "text-neutral-500 hover:text-neutral-700"}`}>
                    {activeTab === 'packages' && <motion.div layoutId="activeTab" className="absolute inset-0 bg-neutral-900 rounded-xl shadow-lg" transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />}
                    <span className="relative z-10">Packages</span>
                  </button>
                  <button onClick={() => setActiveTab('activities')} className={`relative px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'activities' ? "text-white" : "text-neutral-500 hover:text-neutral-700"}`}>
                    {activeTab === 'activities' && <motion.div layoutId="activeTab" className="absolute inset-0 bg-neutral-900 rounded-xl shadow-lg" transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />}
                    <span className="relative z-10">Activities</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <div className={`w-2 h-2 rounded-full ${activeTab === 'packages' ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Viewing {activeTab} you've liked</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm shrink-0">
                  <Search className="text-primary w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">Search Results</span>
                  <h3 className="text-2xl">
                    Showing {filteredPackages.length} <span className="text-gray-400 font-medium tracking-tighter text-xl">/ {totalCount} Packages Found</span>
                  </h3>
                  {filters.city && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Exploring in <span className="text-primary">{filters.city}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  {mode === 'activities' ? 'Activity Filter Active' : 'Package Filter Active'}
                </span>
              </div>
            </div>

            <PackageListResults
              packageList={packageList}
              filteredPackages={filteredPackages}
              groupedPackages={groupedPackages}
              filters={filters}
              isLoading={isLoading}
              isError={isError}
              hasMore={hasMore}
              totalCount={totalCount}
              resetAndRefetch={resetAndRefetch}
              refetch={refetch}
              setPackageList={setPackageList}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default FilterPackage;
