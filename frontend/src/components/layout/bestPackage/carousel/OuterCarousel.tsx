'use client';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import InnerCarousel from "./InnerCarousel";
import { calculateDiscountPercentage } from "../constant";
import customArrowLeft from '@/assets/icons/arrowLeft.svg'
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
import { ref } from "process";
import { useNavigate } from "react-router-dom";


export default function OuterCarousel() {

    const navigate = useNavigate()

    const { data, isLoading, isError, refetch } = UseFetchAPIQuery({
        key: ["bestPackage"],
        queryFn: GetBestBackageList,
    });




    const { mutate: updateLikeMutate } = useMutationAPIQuery(UpdateLikePackage, {
        onSuccess: () => {
            refetch();
            console.log('Like status updated successfully');
        }
    });

    if (isLoading) return <p>Loading packages...</p>;
    if (isError) return <p>Error loading packages</p>;

    const bestPackageList = data?.data || [];

    const handleToggleLike = (packageId: string, liked: boolean) => {
        updateLikeMutate({ id: packageId, liked, userId: localStorage.getItem("userId") });
    }
    const handleNavigation = (id: number | string) => {
        navigate(`/package/${id}`)
    }

    return (
        <div className="max-w-7xl mx-auto">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={{
                    nextEl: ".outer-next",
                    prevEl: ".outer-prev",
                }}
                breakpoints={{
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                pagination={{
                    clickable: true,
                    el: '.outer-custom-pagination',
                }}
                style={{
                    padding: '9px'
                }}
                className="outer-swiper pb-12 p-20"
            >
                {bestPackageList?.map((offer: any) => (
                    <SwiperSlide key={offer._id}>
                        <div className="bg-white rounded-md overflow-hidden shadow-xl text-gray-900 flex flex-col">
                            {/* Inner Carousel */}
                            <InnerCarousel images={offer.images} offerId={offer._id} />

                            <div className="absolute top-0 right-0">
                                <div
                                    className="absolute top-5 font-roboto font-normal -right-3 z-20 bg-red-500 text-white font-bold px-4 py-0 w-max"
                                >
                                    <em>{calculateDiscountPercentage(offer?.price, offer?.offerPrice)}% OFF</em>
                                </div>

                                <div
                                    className="absolute top-9 -right-1 h-5 w-2 bg-red-500 brightness-90 rotate-[60deg] z-[-1]"
                                ></div>
                            </div>

                            {/* Offer Details */}
                            <div className="flex flex-col font-roboto gap-3 justify-center p-8">
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
                                                scale: offer?.userLiked ? [1, 1.4, 1] : 1,
                                                rotate: offer?.userLiked ? [0, -8, 8, -5, 5, 0] : 0,
                                            }}
                                            transition={{
                                                duration: 0.35,
                                                type: "spring",
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
                                        <img src={whatsappIcon} alt="whatsapp" className="w-12 h-12" />
                                        <AnimatedButton buttonText="Contact us" borderButtonColor={'bg-white'} textColor={'text-white'} bgColor="bg-custom-black" className="hover:bg-custom-black w-3/4" onClick={()=>handleNavigation(offer?._id)} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Outer Navigation */}

            {/* Mobile */}
            <button className="outer-prev absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-md z-50 sm:hidden">
                <img src={arrowLeft} className="w-6 h-6" />
            </button>

            <button className="outer-next absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-md z-50 sm:hidden">
                <img src={arrowRight} className="w-6 h-6" />
            </button>

            {/* Desktop */}
            <button className="outer-prev absolute left-0 top-[53%] -translate-y-1/2 z-50 hidden sm:block">
                <img src={customArrowLeft} className="w-20 h-20" />
            </button>

            <button className="outer-next absolute right-0 top-[53%] -translate-y-1/2 z-50 hidden sm:block">
                <img src={customArrowRight} className="w-20 h-20" />
            </button>

            <div className="outer-custom-pagination mt-6 flex justify-center gap-2"></div>
        </div>
    );
}
