'use client';

import { useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllPackageList, GetBestBackageList } from "@/api/user/api";
import { SinglePackageCard } from "../packageCard/PackageCard";
import PackageCardSkeleton from "../packageCard/PackageCardSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface SuggestedProductsProps {
    currentPackageId?: string;
    activityCategory?: string;
    packageType?: string;
    location?: string;
    title?: string;
    className?: string;
    onlyActivities?: boolean;
    excludeActivities?: boolean;
}

export default function SuggestedProducts({
    currentPackageId,
    activityCategory,
    packageType,
    location,
    title = "You might also like",
    className = "",
    onlyActivities = false,
    excludeActivities = false
}: SuggestedProductsProps) {
    const queryClient = useQueryClient();
    const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

    // Fetch related packages: prioritize activityCategory, then packageType, then location
    // We fetch a bit more than needed to ensure we have enough after filtering currentPackageId
    const { data: relatedData, isLoading: isRelatedLoading } = UseFetchAPIQuery({
        key: ["relatedPackages", { activityCategory, packageType, location, currentPackageId, onlyActivities, excludeActivities }],
        queryFn: () => GetAllPackageList({
            limit: 12,
            activityCategory: activityCategory || '',
            search: !activityCategory ? (packageType || location || '') : '',
            onlyActivities,
            excludeActivities
        }),
        options: {
            enabled: !!(activityCategory || packageType || location || onlyActivities),
        }
    });

    // Fallback to Best Packages if no related found or no criteria
    const { data: bestData, isLoading: isBestLoading } = UseFetchAPIQuery({
        key: ["bestPackagesSuggestions", { onlyActivities, excludeActivities }],
        queryFn: async () => {
            // Ideally BestPackage endpoint should support filters, but if not we use common list
            if (onlyActivities || excludeActivities) {
                return GetAllPackageList({ limit: 12, onlyActivities, excludeActivities });
            }
            return GetBestBackageList();
        },
        options: {
            enabled: !isRelatedLoading && (!relatedData?.data || relatedData.data.length <= 1),
        }
    });

    const isLoading = isRelatedLoading || (isBestLoading && !relatedData?.data?.length);

    const suggestList = useMemo(() => {
        let list = relatedData?.data || [];
        
        // If related list is too small (e.g., only the current package), use best packages
        if (list.length <= 1 && bestData?.data) {
            list = bestData.data;
        }

        // Filter out current package if ID is provided
        return list.filter((pkg: any) => pkg._id !== currentPackageId).slice(0, 8);
    }, [relatedData, bestData, currentPackageId]);

    if (isLoading) {
        return (
            <div className={`py-12 ${className}`}>
                <div className="flex items-center justify-between mb-8">
                    <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-md" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => <PackageCardSkeleton key={n} />)}
                </div>
            </div>
        );
    }

    if (!suggestList.length) return null;

    return (
        <section className={`py-12 px-4 sm:px-0 ${className}`}>
            <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">
                    {title}
                </h2>
                
                <div className="flex gap-2">
                    <button
                        ref={(node) => setPrevEl(node)}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        ref={(node) => setNextEl(node)}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="relative group">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={1}
                    navigation={{
                        prevEl,
                        nextEl,
                    }}
                    onBeforeInit={(swiper) => {
                        // @ts-ignore
                        swiper.params.navigation.prevEl = prevEl;
                        // @ts-ignore
                        swiper.params.navigation.nextEl = nextEl;
                    }}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                        1280: { slidesPerView: 4 },
                    }}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true
                    }}
                    className="suggested-swiper !pb-4"
                >
                    {suggestList.map((offer: any) => (
                        <SwiperSlide key={offer._id}>
                            <div className="h-full py-2">
                                <SinglePackageCard
                                    offer={offer}
                                    isAdmin={false}
                                    setEditPackageId={() => { }}
                                    setActive={() => { }}
                                    handleLikeUpdate={(id, liked) => {
                                        // Standard like update logic
                                        queryClient.setQueryData(["relatedPackages", { activityCategory, packageType, location, currentPackageId, onlyActivities, excludeActivities }], (oldData: any) => {
                                            if (!oldData) return oldData;
                                            return {
                                                ...oldData,
                                                data: oldData.data.map((item: any) =>
                                                    item._id === id ? { ...item, userLiked: liked } : item
                                                ),
                                            };
                                        });
                                        queryClient.setQueryData(["bestPackagesSuggestions", { onlyActivities, excludeActivities }], (oldData: any) => {
                                            if (!oldData) return oldData;
                                            return {
                                                ...oldData,
                                                data: oldData.data.map((item: any) =>
                                                    item._id === id ? { ...item, userLiked: liked } : item
                                                ),
                                            };
                                        });
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
