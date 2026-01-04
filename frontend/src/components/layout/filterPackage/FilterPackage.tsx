import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useContext, useEffect, useMemo, useState } from "react";
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

    const methods = useForm<FilterConfigForm>({
        defaultValues,
        mode: "onChange",
    });

    const filters = useWatch({
        name: "filterConfig",
        control: methods.control,
    });

    const { data, isLoading, isError, refetch } = UseFetchAPIQuery({
        key: ["allPackage", cursor],
        queryFn: () =>
            GetAllPackageList({
                limit: PAGE_SIZE,
                lastId: cursor,
            }),
        options: {
            enabled: false
        }
    });

    useEffect(() => {
        refetch()
    }, [])

    useEffect(() => {
        if (data?.data?.length) {
            setPackageList((prev) => [...prev, ...data.data]);
            setCursor(data.nextCursor);
            setHasMore(data.hasMore);
        }
    }, [data]);

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

    if (isError) return (
        <div className="flex justify-center items-center h-full">
            <PackageErrorSkeleton message="No data available" />
        </div>
    );

    return (
        <FormProvider {...methods}>
            <div className="sm:p-6 flex flex-col sm:flex-row sm:justify-around bg-[#3F4FB] md:h-screen">

                {/* ✅ LEFT FILTER - STICKY */}
                <div className="w-full sm:w-[25%] xl:w-[17%] sticky top-0 md:h-screen self-start z-40">
                    <FilterConfigPage />
                </div>

                {/* ✅ RIGHT PACKAGE LIST - SCROLLABLE */}
                <div className="w-full sm:w-[75%] xl:-[78%] overflow-y-auto p-2 pr-2">
                    <h2 className="text-xl font-roboto mb-3 text-white">
                        Packages ({filteredPackages?.length || 0})
                    </h2>

                    {/* LOADING STATE - Show Skeleton */}
                    {isLoading && !packageList.length ? (
                        <div className="flex flex-col gap-0 w-full">
                            {[1, 2, 3].map((n) => (
                                <PackageCardSkeleton key={n} />
                            ))}
                        </div>
                    ) : (
                        <>
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

                            {hasMore && (
                                <div className="text-center py-6">
                                    <AnimatedButton buttonText={isLoading ? "Loading..." : "Load more"} onClick={() => refetch()} className="w-[200px]" />
                                </div>
                            )}

                            {!filteredPackages.length && !isLoading && (
                                <NoDataFound message="No Packages Found" subMessage="Try adjusting your filters to find what you're looking for." />
                            )}
                        </>
                    )}
                </div>

            </div>
        </FormProvider>
    );
};

export default FilterPackage;
