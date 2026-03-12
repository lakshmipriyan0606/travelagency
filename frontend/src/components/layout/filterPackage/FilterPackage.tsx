import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { filterPackages, generateDefaultValues } from "./constant";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllPackageList } from "@/api/user/api";
import PackageCard from "../packageCard/PackageCard";
import FilterConfigPage from "./filterConfigPage";
import { AdminPanelContext } from "@/pages/Admin/AdminPanel/AdminPanel";
import { useLocation } from "react-router-dom";
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";

import PackageCardSkeleton from "../packageCard/PackageCardSkeleton";
import NoDataFound from "../NoDataFound/NoDataFound";
import PackageErrorSkeleton from "../packageCard/PackageErrorSkeleton";

type FilterConfigForm = {
    filterConfig: {
        [key: string]: {
            [value: string]: boolean;
        };
    };
};

const PAGE_SIZE = 5;

const FilterPackage = () => {
    const { pathname } = useLocation();
    const isLikePackageFlow = pathname?.includes("likePackage");

    const context = useContext(AdminPanelContext);
    const defaultValues = useMemo(() => generateDefaultValues(), []);

    const [packageList, setPackageList] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const lastProcessedCursor = useRef<string | null>(null);

    const methods = useForm<FilterConfigForm>({
        defaultValues,
        mode: "onChange",
    });

    const filters = useWatch({
        name: "filterConfig",
        control: methods.control,
    });

    const queryKey = useMemo(() => ["allPackage", cursor], [cursor]);

    const { data, isLoading, isError, refetch } = UseFetchAPIQuery({
        key: queryKey,
        queryFn: () =>
            GetAllPackageList({
                limit: PAGE_SIZE,
                lastId: cursor,
            }),
        options: {
            enabled: false
        }
    });

    // Reset list when filters change significantly
    useEffect(() => {
        setPackageList([]);
        setCursor('');
        setHasMore(true);
        lastProcessedCursor.current = "RESET"; // Force re-process of first page
        setTimeout(() => refetch(), 0);
    }, [filters, isLikePackageFlow]);

    useEffect(() => {
        if (data && lastProcessedCursor.current !== cursor) {
            if (data.data?.length) {
                setPackageList((prev) => {
                    // Prevent duplicates
                    const newPackages = data.data.filter(
                        (newPkg: any) => !prev.some((prevPkg) => prevPkg._id === newPkg._id)
                    );
                    return [...prev, ...newPackages];
                });
            }

            // Mark this cursor as processed
            lastProcessedCursor.current = cursor;

            const nextCursor = data.nextCursor;
            if (nextCursor) {
                setCursor(nextCursor);
            }
            setHasMore(data.hasMore || false);
        }
    }, [data, cursor]);

    const removeDaysKey = (data: any) => {
        const { days, ...rest } = data;
        return rest;
    };

    const cleanPackageList = useMemo(
        () => packageList.map((item) => removeDaysKey(item)),
        [packageList]
    );

    // ✅ Filtering AFTER pagination
    const filteredPackages = useMemo(() => {
        const packageList = filterPackages(cleanPackageList, filters);
        const finalPackageList = isLikePackageFlow
            ? packageList?.filter((list) => list?.userLiked)
            : packageList;

        return finalPackageList;
    }, [cleanPackageList, filters, isLikePackageFlow]);

    const renderContent = () => {
        if (isError && !packageList.length) {
            return (
                <div className="flex justify-center items-center h-full">
                    <PackageErrorSkeleton message="Failed to load packages" />
                </div>
            );
        }

        if (isLoading && !packageList.length) {
            return (
                <div className="flex flex-col gap-0 w-full">
                    {[1, 2, 3].map((n) => (
                        <PackageCardSkeleton key={n} />
                    ))}
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
                        handleLikeUpdate={(packageId: string, liked: boolean) => {
                            setPackageList((prev) =>
                                prev.map((pkg) =>
                                    pkg._id === packageId
                                        ? { ...pkg, userLiked: liked }
                                        : pkg
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
                    <div className="text-center py-10 bg-zinc-800/20 rounded-xl border border-dashed border-zinc-700">
                        <p className="text-zinc-400 mb-2">No matches in this batch...</p>
                        <p className="text-zinc-500 text-sm">More packages are available. Try loading more!</p>
                    </div>
                ) : null}

                {/* Loading state for next page */}
                {isLoading && packageList.length > 0 && (
                    <div className="flex flex-col gap-0 w-full">
                        {[1].map((n) => (
                            <PackageCardSkeleton key={n} />
                        ))}
                    </div>
                )}

                {/* Error state for next page */}
                {isError && packageList.length > 0 && (
                    <div className="text-center py-4 text-red-400">
                        Failed to load more packages. Please try again.
                    </div>
                )}

                {hasMore && (
                    <div className="text-center py-6">
                        <AnimatedButton
                            buttonText={isLoading ? "Loading..." : "Load more"}
                            onClick={() => refetch()}
                            className="w-[200px]"
                            disabled={isLoading}
                        />
                    </div>
                )}
            </>
        );
    };

    return (
        <FormProvider {...methods}>
            <div className="sm:mt-20 flex flex-col sm:flex-row sm:justify-around bg-[#3F4FB]">

                {/* ✅ LEFT FILTER - STICKY */}
                <div className="w-full sm:w-[25%] xl:w-[17%] md:sticky md:top-0 self-start z-40 bg-zinc-900 sm:bg-transparent">
                    <FilterConfigPage />
                </div>

                {/* ✅ RIGHT PACKAGE LIST - SCROLLABLE */}
                <div className="w-full sm:w-[75%] xl:w-[78%] overflow-y-auto p-2 pr-2">
                    <h2 className="text-xl mb-3 text-white">
                        Packages ({filteredPackages?.length || 0})
                    </h2>

                    {renderContent()}
                </div>

            </div>
        </FormProvider>
    );
};

export default FilterPackage;
