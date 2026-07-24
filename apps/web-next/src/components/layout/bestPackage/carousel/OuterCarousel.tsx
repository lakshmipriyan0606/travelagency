'use client';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import customArrowLeft from '@/assets/icons/arrowleft.svg'
import customArrowRight from '@/assets/icons/arrowright.svg'
import arrowLeft from '@/assets/icons/leftarrow.svg'
import arrowRight from '@/assets/icons/rightarrow.svg'
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetBestBackageList } from "@/api/user/api";
import { useQueryClient } from "@tanstack/react-query";
import WrapperCardSkeleton from "./WrapperCardSkeleton";
import NoDataSkeleton from "./NoDataSkeleton";
import { useState } from "react";
import { SinglePackageCard } from "../../packageCard/PackageCard";


export default function OuterCarousel({ initialPackages }: { initialPackages?: any[] }) {

    const queryClient = useQueryClient();
    const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

    const { data, isLoading, isError } = UseFetchAPIQuery({
        key: ["bestPackage"],
        queryFn: GetBestBackageList,
        // @ts-ignore
        initialData: initialPackages ? { data: initialPackages } : undefined,
    });





    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto">
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}
                    slidesPerView={1}
                    breakpoints={{
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                    className="outer-swiper pb-12 p-20"
                    style={{ padding: '9px' }}
                >
                    {[1, 2, 3].map((n) => (
                        <SwiperSlide key={n}>
                            <WrapperCardSkeleton />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        )
    }


    const bestPackageList = data?.data || [];

    if (!isLoading && bestPackageList.length === 0 || isError) {
        return (
            <div className="max-w-7xl mx-auto p-5">
                <NoDataSkeleton />
            </div>
        )
    }



    return (
        <div className="max-w-7xl mx-auto relative">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={30}
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
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                pagination={{
                    clickable: true,
                    el: '.outer-custom-pagination',
                }}
                watchOverflow={true}
                observer={true}
                observeParents={true}
                style={{
                    padding: '9px'
                }}
                className="outer-swiper pb-12"
            >
                {bestPackageList?.map((offer: any) => (
                    <SwiperSlide key={offer._id}>
                        <div className="mt-3 h-full">
                            <SinglePackageCard
                                offer={offer}
                                isAdmin={false} // Best Package carousel is typically for users
                                setEditPackageId={() => { }}
                                setActive={() => { }}
                                handleLikeUpdate={(id, liked) => {
                                    // Custom like update for BestPackage query
                                    queryClient.setQueryData(["bestPackage"], (oldData: any) => {
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

            {/* Outer Navigation Buttons */}
            {bestPackageList.length > 1 && (
                <>
                    {/* Previous Button */}
                    <button
                        ref={(node) => setPrevEl(node)}
                        className="outer-prev absolute left-2 lg:left-0 xl:left-[-60px] top-[45%] -translate-y-1/2 z-50 cursor-pointer p-2 bg-white sm:bg-transparent rounded-full shadow-md sm:shadow-none transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
                        aria-label="Previous slide"
                    >
                        <img src={arrowLeft} className="w-6 h-6 sm:hidden" alt="" />
                        <img src={customArrowLeft} className="hidden sm:block w-16 h-16 lg:w-20 lg:h-20" alt="" />
                    </button>

                    {/* Next Button */}
                    <button
                        ref={(node) => setNextEl(node)}
                        className="outer-next absolute right-2 lg:right-0 xl:right-[-60px] top-[45%] -translate-y-1/2 z-50 cursor-pointer p-2 bg-white sm:bg-transparent rounded-full shadow-md sm:shadow-none transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
                        aria-label="Next slide"
                    >
                        <img src={arrowRight} className="w-6 h-6 sm:hidden" alt="" />
                        <img src={customArrowRight} className="hidden sm:block w-16 h-16 lg:w-20 lg:h-20" alt="" />
                    </button>
                </>
            )}

            {bestPackageList.length > 1 && (
                <div className="outer-custom-pagination mt-6 flex justify-center gap-2"></div>
            )}
        </div>
    );
}
