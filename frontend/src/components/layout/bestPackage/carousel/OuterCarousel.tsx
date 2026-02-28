'use client';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import InnerCarousel from "./InnerCarousel";
import { calculateDiscountPercentage } from "../constant";
import customArrowLeft from '@/assets/icons/arrowleft.svg'
import customArrowRight from '@/assets/icons/arrowright.svg'
import arrowLeft from '@/assets/icons/leftarrow.svg'
import arrowRight from '@/assets/icons/rightarrow.svg'
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import whatsappIcon from '@/assets/icons/whatsapp.svg';
import location from '@/assets/icons/location.svg';
import star from '@/assets/icons/Star.svg';
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import dateIcon from '@/assets/icons/date.svg';
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetBestBackageList, UpdateLikePackage } from "@/api/user/api";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { WANumber } from "@/lib/utils";
import WrapperCardSkeleton from "./WrapperCardSkeleton";
import NoDataSkeleton from "./NoDataSkeleton";
import { useState } from "react";


export default function OuterCarousel() {

    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

    const { data, isLoading, isError, } = UseFetchAPIQuery({
        key: ["bestPackage"],
        queryFn: GetBestBackageList,
    });
    const { mutate: updateLikeMutate } = useMutationAPIQuery(UpdateLikePackage, {
        onMutate: async (data: { id: number | string, liked: boolean, userId: string | null }) => {
            await queryClient.cancelQueries({ queryKey: ["bestPackage"] });

            const previousData = queryClient.getQueryData<any>(["bestPackage"]);

            queryClient.setQueryData(["bestPackage"], (oldData: any) => {
                return {
                    ...oldData,
                    data: oldData.data.map((item: any) =>
                        item._id === data?.id
                            ? { ...item, userLiked: data?.liked }
                            : item
                    ),
                };
            });

            return { previousData };
        },

        onError: (_err, _variables, context) => {
            queryClient.setQueryData(["bestPackage"], context?.previousData);
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["bestPackage"] });
        },
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
            <div className="max-w-7xl mx-auto p-20">
                <NoDataSkeleton />
            </div>
        )
    }

    const handleToggleLike = (packageId: string, liked: boolean) => {
        updateLikeMutate({ id: packageId, liked, userId: localStorage.getItem("userId") });
    }
    const handleNavigation = (id: number | string) => {
        navigate(`/package/${id}`)
    }

    const handleSendToWhatsApp = (currPackage: any) => {
        const phoneNumber = WANumber

        const message = `Hi! I am interested in ${currPackage?.packageName}. Please share the details. Thanks!`;


        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");
    };


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
                        <div className="bg-white rounded-md overflow-hidden shadow-xl text-gray-900 flex flex-col mt-3">
                            {/* Inner Carousel */}
                            <InnerCarousel images={offer.images} offerId={offer._id} />

                            <div className="absolute top-0 right-0">
                                <div
                                    className="absolute top-5 font-body font-normal -right-3 z-20 bg-red-500 text-white font-bold px-4 py-0 w-max overflow-hidden relative"
                                >
                                    <div className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                    <em className="relative z-10">{calculateDiscountPercentage(offer?.price, offer?.offerPrice)}% OFF</em>
                                </div>

                                <div
                                    className="absolute top-9 -right-1 h-5 w-2 bg-red-500 brightness-90 rotate-[60deg] z-[-1]"
                                ></div>
                            </div>

                            {/* Offer Details */}
                            <div className="flex flex-col font-body gap-3 justify-center p-[15px]">
                                <div className="flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-3 ">
                                        <span>
                                            <img src={location} alt="" />
                                        </span>
                                        <h3 className="">{offer.location}</h3>
                                    </div>
                                    <div className="cursor-pointer">
                                        <motion.button
                                            onClick={() => handleToggleLike(offer?._id, !offer?.userLiked)}
                                            whileTap={{ scale: 0.75 }}
                                            animate={{
                                                scale: offer.userLiked ? [1, 1.4, 1] : 1,
                                                rotate: offer.userLiked ? [0, -8, 8, -5, 5, 0] : 0,
                                            }}
                                            transition={{
                                                duration: 0.35,
                                                ease: "easeInOut",
                                                type: "tween"
                                            }}
                                            className="p-2 cursor-pointer"
                                        >
                                            <Heart
                                                className={`${offer?.userLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                                                    } transition-all duration-300`}
                                                size={24}
                                            />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {<img src={dateIcon} alt="" />}
                                    <h3 className="">   {offer?.daysAndNights || ''}</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    {<img src={star} alt="" />}
                                    <h3 className="">   {offer.rating}</h3>
                                </div>
                                <div className="flex flex-col justify-between items-start mt-2 gap-3">
                                    <div className="flex justify-between gap-4  items-center">
                                        <span className="font-semibold">From</span>

                                        <span className="text-lg flex items-center">
                                            <span className="relative inline-block text-base mr-2">
                                                {offer.price}
                                                <span className="absolute right-0 top-[40%] w-full h-[3px] bg-red-500 rotate-[10deg]"></span>
                                            </span>

                                            <span className="sm:text-lg font-semibold">
                                                {offer.offerPrice}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="w-full h-[2px] bg-gray-300"></div>
                                    <div className="flex  gap-4 w-full items-center">
                                        <img src={whatsappIcon} alt="whatsapp" className="w-12 h-12 cursor-pointer" onClick={() => handleSendToWhatsApp(offer)} />
                                        <AnimatedButton buttonText="CONTACT US" borderButtonColor={'bg-white'} textColor={'text-white'} bgColor="bg-custom-black" className="hover:bg-custom-black w-3/4" onClick={() => handleNavigation(offer?._id)} />
                                    </div>
                                </div>

                            </div>
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
