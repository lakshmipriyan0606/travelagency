"use client";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, Search } from "lucide-react";
import { motion } from "framer-motion";

import {
    FilterState,
    SortOption,
    buildEmptyFilterConfig,
    filterPackages,
    sortPackages,
    buildURLParams,
    parseURLParams,
} from "./constant";

import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllPackageList, GetLikedPackageList } from "@/api/user/api";
import PackageCard from "../packageCard/PackageCard";
import FilterConfigPage from "./filterConfigPage";
import PackageCardSkeleton from "../packageCard/PackageCardSkeleton";
import NoDataFound from "../NoDataFound/NoDataFound";
import PackageErrorSkeleton from "../packageCard/PackageErrorSkeleton";
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import Breadcrumb, { BreadcrumbItem } from "@/components/common/Breadcrumb/Breadcrumb";
// removed AdminPanelContext
import { useContext } from "react";
import FilterSearchBar from "./FilterSearchBar";

import { MALAYSIA_CITIES } from "@/config/destinations";
import { PACKAGE_CONFIG } from "@/config/packageConfig";
import { GLOBAL_CONFIG } from "@/config/globalConfig";

const PAGE_SIZE = PACKAGE_CONFIG.INITIAL_LOAD_LIMIT;

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb builder
// ─────────────────────────────────────────────────────────────────────────────

const buildBreadcrumb = (filters: FilterState, mode: string): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: mode === 'activities' ? "All Activities" : "All Packages", href: mode === 'activities' ? "/activities" : "/allpackage" },
    ];

    // Show active package type as last crumb
    const activeType = Object.entries(filters.filterConfig?.packageType ?? {})
        .find(([, v]) => v)?.[0];

    if (activeType) {
        items.push({ label: activeType });
    }

    return items;
};

// ─────────────────────────────────────────────────────────────────────────────
// SelectedFilters Tags Row (laptop)
// ─────────────────────────────────────────────────────────────────────────────

interface SelectedFiltersProps {
    filters: FilterState;
    onRemove: (group: string, value: string) => void;
    onClearAll: () => void;
}

const SelectedFiltersRow: React.FC<SelectedFiltersProps> = ({
    filters,
    onRemove,
    onClearAll,
}) => {
    const activeTags: { group: string; value: string }[] = [];
    Object.entries(filters.filterConfig ?? {}).forEach(([group, values]) => {
        Object.entries(values).forEach(([val, checked]) => {
            if (checked) activeTags.push({ group, value: val });
        });
    });
    if (filters.city) activeTags.push({ group: "city", value: filters.city });

    if (!activeTags.length) return null;

    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Dotted Line */}
            <div className="w-full border-t-2 border-dotted border-gray-300"></div>

            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">
                        Selected Filters
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {activeTags.map(({ group, value }) => (
                            <span
                                key={`${group}-${value}`}
                                className="flex items-center gap-1 bg-primary text-white text-[10px] xl:text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest"
                            >
                                {value}
                                <button
                                    onClick={() => onRemove(group, value)}
                                    className="ml-1 hover:opacity-70 cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClearAll}
                    className="hidden md:block text-[10px] xl:text-xs font-bold text-gray-700 hover:text-red-500 transition-colors bg-[#FFE5E5] px-6 py-3 rounded-md whitespace-nowrap cursor-pointer uppercase tracking-[0.2em]"
                >
                    CLEAR FILTERS
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main FilterPackage component
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPackageProps {
    /** When true, only shows packages the user has liked */
    likePackageOnly?: boolean;
    /** 'packages' shows standard pkgs, 'activities' shows activity pkgs, 'all' shows everything */
    mode?: 'packages' | 'activities' | 'all';
}

const FilterPackage = ({ likePackageOnly = false, mode = 'all' }: FilterPackageProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // ── Pagination state
    const [packageList, setPackageList] = useState<any[]>([]);
    const [cursor, setCursor] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const lastProcessedCursor = useRef<string | null>(null);

    // ── Tab state for Likes page
    const [activeTab, setActiveTab] = useState<'packages' | 'activities'>('packages');

    // ── Local search input (not in form, to avoid triggering URL updates on every keystroke)
    const [searchInput, setSearchInput] = useState("");

    // ── Sort state (lifted up from FilterConfigPage)
    const [sort, setSort] = useState<SortOption>("default");

    // ── Initialise form from URL
    const defaultValues = useMemo(() => parseURLParams(`?${searchParams.toString()}`), []);
    const methods = useForm<FilterState>({ defaultValues, mode: "onChange" });

    const { watch, setValue, reset } = methods;
    const filters = watch();

    // ── Sync URL on filter change
    useEffect(() => {
        const params = buildURLParams(filters);
        router.replace(`${pathname}?${params.toString()}`);
    }, [
        JSON.stringify(filters.filterConfig),
        filters.city,
        filters.sort,
        filters.search,
    ]);

    // ── Sync initial search input from URL
    useEffect(() => {
        setSearchInput(filters.search ?? "");
        setSort((filters.sort as SortOption) ?? "default");
    }, []);

    // ─── API
    const isAdminMode = false;
    const queryKey = useMemo(
        () => ["allPackage", cursor, filters.search, filters.city, isAdminMode, mode, likePackageOnly, activeTab],
        [cursor, filters.search, filters.city, isAdminMode, mode, likePackageOnly, activeTab]
    );
    const { data, isLoading, isError, refetch } = UseFetchAPIQuery({
        key: queryKey,
        queryFn: () => {
            // Likes page should use a dedicated endpoint (ensures userLiked is correct)
            if (likePackageOnly) {
                const onlyActivities = activeTab === 'activities';
                const excludeActivities = activeTab === 'packages';
                return GetLikedPackageList({
                    limit: PAGE_SIZE,
                    lastId: cursor,
                    onlyActivities,
                    excludeActivities
                });
            }

            const onlyActivities = mode === 'activities';
            const excludeActivities = mode === 'packages';
            return GetAllPackageList({
                limit: PAGE_SIZE,
                lastId: cursor,
                search: filters.search,
                city: filters.city,
                isAdmin: isAdminMode,
                onlyActivities,
                excludeActivities
            });
        },
        options: { enabled: false },
    });

    // Reset list on filter change
    useEffect(() => {
        setPackageList([]);
        setCursor("");
        setHasMore(true);
        setTotalCount(0);
        lastProcessedCursor.current = "RESET";
        setTimeout(() => refetch(), 0);
    }, [JSON.stringify(filters.filterConfig), filters.search, filters.city, likePackageOnly, mode, activeTab]);

    // Accumulate pages
    const dataProcessedRef = useRef<any>(null);

    useEffect(() => {
        if (data && data !== dataProcessedRef.current) {
            dataProcessedRef.current = data;

            if (data.data?.length) {
                setPackageList((prev) => {
                    const newPkgs = data.data.filter(
                        (pkg: any) => !prev.some((p) => p._id === pkg._id)
                    );
                    return [...prev, ...newPkgs];
                });
            }

            if (data.nextCursor) {
                setCursor(data.nextCursor);
            }
            if (data.totalCount !== undefined) setTotalCount(data.totalCount);
            setHasMore(data.hasMore || false);
        }
    }, [data]);

    // ─── Computed
    const filteredPackages = useMemo(() => {
        const pkgs = filterPackages(packageList, filters);
        let liked = likePackageOnly ? pkgs.filter((p) => p.userLiked) : pkgs;

        // Apply Tab Filter when in Likes mode
        if (likePackageOnly) {
            liked = liked.filter((p) => {
                const isActivity =
                    p.type === 'activity' ||
                    (p.activityCategory && p.activityCategory !== "" && p.activityCategory !== "none");
                return activeTab === 'activities' ? isActivity : !isActivity;
            });
        }

        return sortPackages(liked, sort);
    }, [packageList, filters, likePackageOnly, sort, activeTab]);

    // If user has likes only in the other tab, auto-switch once.
    useEffect(() => {
        if (!likePackageOnly) return;
        const liked = (packageList || []).filter((p) => p.userLiked);
        const likedActivities = liked.filter((p) =>
            p.type === 'activity' || (p.activityCategory && p.activityCategory !== "" && p.activityCategory !== "none")
        ).length;
        const likedPackages = liked.length - likedActivities;

        if (activeTab === 'packages' && likedPackages === 0 && likedActivities > 0) {
            setActiveTab('activities');
        }
        if (activeTab === 'activities' && likedActivities === 0 && likedPackages > 0) {
            setActiveTab('packages');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [likePackageOnly, packageList]);

    const breadcrumbItems = useMemo(() => buildBreadcrumb(filters, mode), [filters, mode]);


    // ─── Active filter tags removal
    const handleRemoveTag = useCallback(
        (group: string, value: string) => {
            if (group === "city") {
                setValue("city", "");
            } else {
                setValue(`filterConfig.${group}.${value}` as any, false);
            }
        },
        [setValue]
    );

    const handleClearAll = useCallback(() => {
        reset({
            filterConfig: buildEmptyFilterConfig(),
            country: "Malaysia",
            city: "",
            search: "",
            sort: "default",
        });
        setSearchInput("");
        setSort("default");
    }, [reset]);

    const handleSearch = (customSearch?: string) => {
        const valueToSearch = typeof customSearch === 'string' ? customSearch : searchInput;
        setValue("search", valueToSearch);
    };

    const resetAndRefetch = useCallback(() => {
        setPackageList([]);
        setCursor("");
        setHasMore(true);
        setTotalCount(0);
        lastProcessedCursor.current = "RESET";
        setTimeout(() => refetch(), 0);
    }, [refetch]);

    const citiesFromConfig = GLOBAL_CONFIG.destinations.map((d: { value: string }) => d.value);

    const groupedPackages = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredPackages.forEach((pkg) => {
            const city = pkg.location || "Other";
            if (!groups[city]) groups[city] = [];
            groups[city].push(pkg);
        });
        return groups;
    }, [filteredPackages]);

    // ─── Render helpers
    const renderContent = () => {
        if (isError && !packageList.length) {
            return (
                <div className="flex justify-center items-center py-10 w-full min-h-[400px]">
                    <PackageErrorSkeleton
                        message="Failed to load packages"
                        onRetry={() => resetAndRefetch()}
                    />
                </div>
            );
        }

        if (isLoading && !packageList.length) {
            return (
                <div className={isAdminMode ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <PackageCardSkeleton key={n} />)}
                </div>
            );
        }

        if (filteredPackages.length === 0 && !isLoading) {
            return (
                <NoDataFound
                    message="No Packages Found"
                    subMessage="Try adjusting your filters or search criteria."
                />
            );
        }

        // If a specific city is selected, only show those packages (no grouping needed)
        if (filters.city) {
            return (
                <section key={filters.city} className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1.5 bg-primary rounded-full shadow-sm"></div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                            {filters.city} <span className="text-primary font-medium ml-2">({filteredPackages.length})</span>
                        </h2>
                    </div>
                    <PackageCard
                        filterList={filteredPackages}
                        isAdmin={false}
                        setEditPackageId={() => { }}
                        setActive={() => { }}
                        refetch={resetAndRefetch}
                        handleLikeUpdate={(id, liked) => {
                            setPackageList((prev) =>
                                prev.map((pkg) =>
                                    pkg._id === id ? { ...pkg, userLiked: liked } : pkg
                                )
                            );
                        }}
                    />
                </section>
            );
        }

        // Default: Group by City
        return (
            <div className="space-y-16">
                {citiesFromConfig.map((cityName: string) => {
                    const packages = groupedPackages[cityName] || [];
                    if (packages.length === 0) return null;

                    return (
                        <section key={cityName} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1.5 bg-primary rounded-full shadow-sm"></div>
                                <h2 className="text-2xl text-gray-900  uppercase">
                                    {cityName} <span className="text-primary font-medium ml-2">({packages.length})</span>
                                </h2>
                            </div>
                            <PackageCard
                                filterList={packages}
                                isAdmin={false}
                                setEditPackageId={() => { }}
                                setActive={() => { }}
                                refetch={resetAndRefetch}
                                handleLikeUpdate={(id, liked) => {
                                    setPackageList((prev) =>
                                        prev.map((pkg) =>
                                            pkg._id === id ? { ...pkg, userLiked: liked } : pkg
                                        )
                                    );
                                }}
                            />
                        </section>
                    );
                })}

                {/* Handle packages that don't match known cities */}
                {groupedPackages["Other"]?.length > 0 && (
                    <section key="Other" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1.5 bg-gray-400 rounded-full shadow-sm"></div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                                Other Locations <span className="text-gray-400 font-medium ml-2">({groupedPackages["Other"].length})</span>
                            </h2>
                        </div>
                        <PackageCard
                            filterList={groupedPackages["Other"]}
                            isAdmin={false}
                            setEditPackageId={() => { }}
                            setActive={() => { }}
                            refetch={resetAndRefetch}
                            handleLikeUpdate={(id, liked) => {
                                setPackageList((prev) =>
                                    prev.map((pkg) =>
                                        pkg._id === id ? { ...pkg, userLiked: liked } : pkg
                                    )
                                );
                            }}
                        />
                    </section>
                )}

                {isLoading && packageList.length > 0 && (
                    <div className={isAdminMode ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"}>
                        <PackageCardSkeleton />
                    </div>
                )}
                {isError && packageList.length > 0 && (
                    <div className="text-center py-4 text-red-400 text-sm">
                        Failed to load more packages. Please try again.
                    </div>
                )}
                {hasMore && packageList.length < totalCount && (
                    <div className="text-center py-6">
                        <AnimatedButton
                            buttonText={isLoading ? "Loading…" : "Load more"}
                            onClick={() => refetch()}
                            className="w-[200px] cursor-pointer"
                            disabled={isLoading}
                        />
                    </div>
                )}
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-white">

                {/* ── TOP SECTION (Breadcrumb + Search) ── */}
                <div className="px-4 sm:px-8 xl:px-16 pt-28 pb-2 relative z-40">
                    {/* Breadcrumb */}
                    <Breadcrumb items={breadcrumbItems} className="mb-3" />

                    {/* Search Header */}
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-wide">
                        SEARCH{" "}
                        <span className="text-sm sm:text-base font-normal text-gray-400 tracking-widest ml-1">
                            GET WHAT YOU WANT EXACTLY
                        </span>
                    </h2>

                    {/* Search bar row */}
                    <div className="mb-4 relative z-50">
                        <FilterSearchBar
                            country={filters.country}
                            setCountry={(val) => setValue("country", val)}
                            city={filters.city}
                            setCity={(val) => setValue("city", val)}
                            cities={MALAYSIA_CITIES}
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                            onSearch={handleSearch}
                            packages={packageList}
                        />
                    </div>

                    {/* Mobile: FILTERS / SORT / CLEAR buttons */}
                    <FilterConfigPage
                        sort={sort}
                        onSortChange={(val) => {
                            setSort(val);
                            setValue("sort", val);
                        }}
                        onClear={handleClearAll}
                        mode="mobile"
                        packageMode={mode}
                    />
                </div>

                {/* ── MAIN CONTENT AREA ── */}
                <div className="flex flex-col gap-0 px-4 sm:px-8 xl:px-16 pb-10 mt-0">

                    {/* TOP: Desktop Filter Bar */}
                    <div className="hidden md:block w-full z-30 mb-2 relative">
                        <FilterConfigPage
                            sort={sort}
                            onSortChange={(val) => {
                                setSort(val);
                                setValue("sort", val);
                            }}
                            onClear={handleClearAll}
                            mode="desktop"
                            packageMode={mode}
                        />
                    </div>

                    {/* PACKAGE LIST SECTION */}
                    <div className="flex-1 w-full min-w-0">
                        {/* Selected filters row */}
                        <div className="w-full">
                            <SelectedFiltersRow
                                filters={filters}
                                onRemove={handleRemoveTag}
                                onClearAll={handleClearAll}
                            />
                        </div>

                        {/* Likes Tab Switcher */}
                        {likePackageOnly && (
                            <div className="flex flex-col gap-4 mb-8">
                                <div className="flex items-center gap-2 p-1.5 bg-neutral-100 rounded-2xl w-fit border border-neutral-200/50 shadow-inner">
                                    <button
                                        onClick={() => setActiveTab('packages')}
                                        className={`relative px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'packages' ? "text-white" : "text-neutral-500 hover:text-neutral-700"
                                            }`}
                                    >
                                        {activeTab === 'packages' && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-neutral-900 rounded-xl shadow-lg"
                                                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                            />
                                        )}
                                        <span className="relative z-10">Packages</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('activities')}
                                        className={`relative px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'activities' ? "text-white" : "text-neutral-500 hover:text-neutral-700"
                                            }`}
                                    >
                                        {activeTab === 'activities' && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-neutral-900 rounded-xl shadow-lg"
                                                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                            />
                                        )}
                                        <span className="relative z-10">Activities</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <div className={`w-2 h-2 rounded-full ${activeTab === 'packages' ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Viewing {activeTab} you've liked
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Result count - Redesigned */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-5">
                                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm shrink-0">
                                    <Search className="text-primary w-6 h-6 stroke-[2.5]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1">
                                        Search Results
                                    </span>
                                    <h3 className="text-2xl">
                                        Showing {filteredPackages.length}{" "}
                                        <span className="text-gray-400 font-medium tracking-tighter text-xl">
                                            / {totalCount} Packages Found
                                        </span>
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

                            {/* Optional: Add a subtle badge for the active mode */}
                            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                    {mode === 'activities' ? 'Activity Filter Active' : 'Package Filter Active'}
                                </span>
                            </div>
                        </div>

                        {renderContent()}
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};

export default FilterPackage;

