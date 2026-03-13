import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

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
import { GetAllPackageList } from "@/api/user/api";
import PackageCard from "../packageCard/PackageCard";
import FilterConfigPage from "./filterConfigPage";
import PackageCardSkeleton from "../packageCard/PackageCardSkeleton";
import NoDataFound from "../NoDataFound/NoDataFound";
import PackageErrorSkeleton from "../packageCard/PackageErrorSkeleton";
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import Breadcrumb, { BreadcrumbItem } from "@/components/common/Breadcrumb/Breadcrumb";
import { AdminPanelContext } from "@/pages/Admin/AdminPanel/AdminPanel";
import { useContext } from "react";
import FilterSearchBar from "./FilterSearchBar";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;
const MALAYSIA_CITIES = [
    "Kuala Lumpur", "Langkawi", "Penang", "Genting Highlands",
    "Malacca", "Johor Bahru", "Kota Kinabalu", "Kuching",
];

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb builder
// ─────────────────────────────────────────────────────────────────────────────

const buildBreadcrumb = (filters: FilterState): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "All Packages", href: "/allpackage" },
    ];

    // Show active package type as last crumb
    const activeType = Object.entries(filters.filterConfig?.packageType ?? {})
        .find(([, v]) => v)?.[0];

    if (activeType) {
        items[1] = { label: "All Packages", href: "/allpackage" };
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
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    Selected Filters
                </span>
                <div className="flex flex-wrap gap-2">
                    {activeTags.map(({ group, value }) => (
                        <span
                            key={`${group}-${value}`}
                            className="flex items-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                        >
                            {value}
                            <button
                                onClick={() => onRemove(group, value)}
                                className="ml-1 hover:opacity-70"
                            >
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
            <button
                onClick={onClearAll}
                className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
                Clear Filters
            </button>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main FilterPackage component
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPackageProps {
    /** When true, only shows packages the user has liked */
    likePackageOnly?: boolean;
}

const FilterPackage = ({ likePackageOnly = false }: FilterPackageProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const context = useContext(AdminPanelContext);

    // ── Pagination state
    const [packageList, setPackageList] = useState<any[]>([]);
    const [cursor, setCursor] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const lastProcessedCursor = useRef<string | null>(null);

    // ── Local search input (not in form, to avoid triggering URL updates on every keystroke)
    const [searchInput, setSearchInput] = useState("");

    // ── Sort state (lifted up from FilterConfigPage)
    const [sort, setSort] = useState<SortOption>("default");

    // ── Initialise form from URL
    const defaultValues = useMemo(() => parseURLParams(location.search), []);
    const methods = useForm<FilterState>({ defaultValues, mode: "onChange" });

    const { watch, setValue, reset } = methods;
    const filters = watch();

    // ── Sync URL on filter change
    useEffect(() => {
        const params = buildURLParams(filters);
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
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
    const isAdminMode = context?.isAdmin || false;
    const queryKey = useMemo(() => ["allPackage", cursor, filters.search, filters.city, isAdminMode], [cursor, filters.search, filters.city, isAdminMode]);
    const { data, isLoading, isError, refetch } = UseFetchAPIQuery({
        key: queryKey,
        queryFn: () => GetAllPackageList({ 
            limit: PAGE_SIZE, 
            lastId: cursor, 
            search: filters.search, 
            city: filters.city,
            isAdmin: isAdminMode 
        }),
        options: { enabled: false },
    });

    // Reset list on filter change
    useEffect(() => {
        setPackageList([]);
        setCursor("");
        setHasMore(true);
        lastProcessedCursor.current = "RESET";
        setTimeout(() => refetch(), 0);
    }, [JSON.stringify(filters.filterConfig), filters.search, filters.city, likePackageOnly]);

    // Accumulate pages
    useEffect(() => {
        if (data && lastProcessedCursor.current !== cursor) {
            if (data.data?.length) {
                setPackageList((prev) => {
                    const newPkgs = data.data.filter(
                        (pkg: any) => !prev.some((p) => p._id === pkg._id)
                    );
                    return [...prev, ...newPkgs];
                });
            }
            lastProcessedCursor.current = cursor;
            if (data.nextCursor) setCursor(data.nextCursor);
            setHasMore(data.hasMore || false);
        }
    }, [data, cursor]);

    // ─── Computed
    const filteredPackages = useMemo(() => {
        const pkgs = filterPackages(packageList, filters);
        const liked = likePackageOnly ? pkgs.filter((p) => p.userLiked) : pkgs;
        return sortPackages(liked, sort);
    }, [packageList, filters, likePackageOnly, sort]);

    const breadcrumbItems = useMemo(() => buildBreadcrumb(filters), [filters]);

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

    const handleSearch = () => {
        setValue("search", searchInput);
    };

    // ─── Render helpers
    const renderContent = () => {
        if (isError && !packageList.length) {
            return (
                <div className="flex justify-center items-center h-40">
                    <PackageErrorSkeleton message="Failed to load packages" />
                </div>
            );
        }

        if (isLoading && !packageList.length) {
            return (
                <div className="flex flex-col gap-0 w-full">
                    {[1, 2, 3].map((n) => <PackageCardSkeleton key={n} />)}
                </div>
            );
        }

        return (
            <>
                {filteredPackages.length > 0 ? (
                    <PackageCard
                        filterList={filteredPackages}
                        isAdmin={context?.isAdmin || false}
                        setEditPackageId={context?.setEditPackageId || (() => { })}
                        setActive={context?.setActive || (() => { })}
                        refetch={refetch}
                        handleLikeUpdate={(id, liked) => {
                            setPackageList((prev) =>
                                prev.map((pkg) =>
                                    pkg._id === id ? { ...pkg, userLiked: liked } : pkg
                                )
                            );
                        }}
                    />
                ) : !isLoading && !hasMore ? (
                    <NoDataFound
                        message="No Packages Found"
                        subMessage="Try adjusting your filters or search criteria."
                    />
                ) : !isLoading && hasMore && packageList.length > 0 ? (
                    <div className="text-center py-10 text-zinc-400">
                        No matches in this batch — try loading more!
                    </div>
                ) : null}

                {isLoading && packageList.length > 0 && (
                    <div className="flex flex-col gap-0 w-full">
                        <PackageCardSkeleton />
                    </div>
                )}
                {isError && packageList.length > 0 && (
                    <div className="text-center py-4 text-red-400 text-sm">
                        Failed to load more packages. Please try again.
                    </div>
                )}
                {hasMore && (
                    <div className="text-center py-6">
                        <AnimatedButton
                            buttonText={isLoading ? "Loading…" : "Load more"}
                            onClick={() => refetch()}
                            className="w-[200px]"
                            disabled={isLoading}
                        />
                    </div>
                )}
            </>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <FormProvider {...methods}>
            <div className="sm:mt-20 min-h-screen bg-white">

                {/* ── TOP SECTION (Breadcrumb + Search) ── */}
                <div className="px-4 sm:px-8 xl:px-16 pt-4 pb-2 relative z-40">
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
                    <div className="mb-4">
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
                        />
                    </div>

                    {/* PACKAGE LIST SECTION */}
                    <div className="flex-1 w-full min-w-0">
                        {/* Selected filters row (laptop only) */}
                        <div className="hidden md:block">
                            <SelectedFiltersRow
                                filters={filters}
                                onRemove={handleRemoveTag}
                                onClearAll={handleClearAll}
                            />
                        </div>

                        {/* Result count */}
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                            <h3 className="text-xl font-bold text-gray-800">
                                {filteredPackages.length}{" "}
                                <span className="font-normal text-gray-500 text-lg">
                                    Package{filteredPackages.length !== 1 ? "s" : ""} found
                                    {filters.city ? ` in ${filters.city}` : ""}
                                </span>
                            </h3>
                        </div>

                        {renderContent()}
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};

export default FilterPackage;
