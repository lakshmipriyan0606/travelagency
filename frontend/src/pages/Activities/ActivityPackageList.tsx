import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { GetAllPackageList } from "@/api/user/api";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import PackageCard from "@/components/layout/packageCard/PackageCard";
import PackageCardSkeleton from "@/components/layout/packageCard/PackageCardSkeleton";
import PackageErrorSkeleton from "@/components/layout/packageCard/PackageErrorSkeleton";
import NoDataFound from "@/components/layout/NoDataFound/NoDataFound";
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";
import { GLOBAL_CONFIG } from "@/config/globalConfig";
import { activityCategoryOptions } from "@/components/layout/Admin/AdminUploadPackage/constant";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import SuggestedProducts from "@/components/layout/suggestedProducts/SuggestedProducts";

const PAGE_SIZE = 8;


// ... constants ...

const ActivityPackageList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeType = searchParams.get("type") || "";

    // Pagination state
    const [packageList, setPackageList] = useState<any[]>([]);
    const [cursor, setCursor] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const lastProcessedCursor = useRef<string | null>(null);

    const queryKey = useMemo(
        () => ["activityPackages", activeType, cursor],
        [activeType, cursor]
    );

    const { data, isLoading, isError, refetch } = UseFetchAPIQuery({
        key: queryKey,
        queryFn: () =>
            GetAllPackageList({
                limit: PAGE_SIZE,
                lastId: cursor,
                activityCategory: activeType,
                onlyActivities: true,
            }),
        options: { enabled: false },
    });

    // Reset list whenever activeType changes
    useEffect(() => {
        setPackageList([]);
        setCursor("");
        setHasMore(true);
        lastProcessedCursor.current = "RESET";
        setTimeout(() => refetch(), 0);
    }, [activeType]);

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

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Activities", href: "/activities" },
        ...(activeType ? [{ label: activeType }] : []),
    ];

    const renderContent = () => {
        if (isError && !packageList.length) {
            return <PackageErrorSkeleton message="Failed to load packages" />;
        }
        if (isLoading && !packageList.length) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <PackageCardSkeleton key={n} />)}
                </div>
            );
        }
        return (
            <>
                {packageList.length > 0 ? (
                    <PackageCard
                        filterList={packageList}
                        isAdmin={false}
                        setEditPackageId={() => { }}
                        setActive={() => { }}
                        isAllPackagePage
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
                        subMessage={activeType ? `No packages available for ${activeType} activity yet.` : "No activity packages available yet."}
                    />
                ) : null}

                {isLoading && packageList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                        <PackageCardSkeleton />
                    </div>
                )}

                {hasMore && (
                    <div className="text-center py-6">
                        <AnimatedButton
                            buttonText={isLoading ? "Loading…" : "Load more"}
                            onClick={() => refetch()}
                            className="w-[200px] cursor-pointer"
                            disabled={isLoading}
                        />
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>{activeType ? `${activeType} Activities & Tours | Travel Agency` : "All Adventure Activities & Tours | Travel Agency"}</title>
                <meta name="description" content={activeType ? `Explore our curated ${activeType} packages and adventure tours. Book your next journey today.` : "Discover a wide range of travel activities and adventure tours from snorkeling to hiking."} />
                <meta name="keywords" content={`travel, activities, ${activeType.toLowerCase()}, tours, adventure`} />
            </Helmet>

            {/* Header */}

            <div className="px-4 sm:px-8 xl:px-16 pt-20 pb-6">
                <Breadcrumb items={breadcrumbItems} className="mb-3" />

                <div className="flex items-end justify-between mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl text-gray-800">
                            {activeType ? (
                                <>
                                    {GLOBAL_CONFIG.activityCategories.find(c => c.value === activeType)?.emoji ?? "🌍"}{" "}
                                    <span className="text-primary">{activeType}</span> Packages
                                </>
                            ) : (
                                "All Activity Packages"
                            )}
                        </h1>
                    </div>
                </div>

                {/* Activity Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    {/* "All" pill */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setSearchParams({});
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${!activeType
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-primary hover:text-primary"
                            }`}
                    >
                        All Activities
                    </motion.button>

                    {activityCategoryOptions.map(({ value, label }) => (
                        <motion.button
                            key={value}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSearchParams({ type: value })}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${activeType === value
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                : "bg-white text-neutral-600 border-neutral-200 hover:border-primary hover:text-primary"
                                }`}
                        >
                            {label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Packages */}
            <div className="px-4 sm:px-8 xl:px-16 pb-16">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                        {packageList.length}{" "}
                        <span className="font-normal text-gray-500 text-lg">
                            Package{packageList.length !== 1 ? "s" : ""} found
                            {activeType ? ` in ${activeType}` : ""}
                        </span>
                    </h3>

                    <button
                        onClick={() => navigate("/allpackage")}
                        className="text-xs text-primary font-black uppercase tracking-widest hover:underline cursor-pointer"
                    >
                        View All Packages →
                    </button>
                </div>

                {renderContent()}
            </div>

            {/* Suggested Products Section */}
            <div className="px-4 sm:px-8 xl:px-16 pb-16">
                <SuggestedProducts 
                    activityCategory={activeType}
                    onlyActivities={true}
                    title={activeType ? `More ${activeType} Experiences` : "You might also like"}
                />
            </div>
        </div>
    );
};

export default ActivityPackageList;
