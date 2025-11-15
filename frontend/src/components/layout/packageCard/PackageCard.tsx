"use client";

import { SwiperSlide } from "swiper/react";
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import whatsappIcon from "@/assets/icons/whatsapp.svg";
import { useDeviceSize } from "@/Hook/UseDevice";
import InnerCarousel from "../bestPackage/carousel/InnerCarousel";
import location from "@/assets/icons/location.svg";
import star from "@/assets/icons/Star.svg";
import heartgray from "@/assets/icons/heartgray.svg";
import dateIcon from "@/assets/icons/date.svg";

import { AnimatePresence, motion } from "framer-motion";

export default function PackageCard({ filterList = [] }) {
    useDeviceSize();

    return (
        <div className="flex flex-col gap-6 items-center justify-center max-w-7xl mx-auto p-2 sm:p-5 w-full">
            <AnimatePresence mode="popLayout">
                {filterList.map((offer: any) => {
                    const details = getOfferDetailsConfig(offer);
                    return (
                        <motion.div
                            key={offer._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: -25 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            // whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex flex-col w-full"
                        >
                            <SwiperSlide className="msm:p-2">
                                <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-xl text-gray-900">

                                    {/* Carousel */}
                                    <div className="w-full sm:relative sm:w-[55%]">
                                        <InnerCarousel images={offer.images} offerId={offer._id} />

                                        {/* Discount Ribbon */}
                                        <div className="absolute top-0 right-0">
                                            <div
                                                className="absolute top-5 font-roboto -right-3 z-20 bg-red-500 text-white font-bold px-4 py-0 w-max"
                                            >
                                                50 % OFF
                                            </div>
                                            <div
                                                className="absolute top-9 -right-1 h-5 w-2 bg-red-500 brightness-90 rotate-[60deg]"
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-col justify-center gap-3 p-8 md:w-[45%] font-roboto">

                                        {/* Header */}
                                        <Row>
                                            <IconText icon={location} text={offer.title} />
                                            <img src={heartgray} alt="" width={22} className="cursor-pointer" />
                                        </Row>

                                        {/* Dynamic details */}
                                        {details.map((d, i) => (
                                            <IconText key={i} icon={d.icon} text={d.label} />
                                        ))}

                                        {/* Price */}
                                        <div className="mt-2 flex flex-col gap-3">
                                            <Row>
                                                <span className="font-semibold">From</span>
                                                <PriceStrike original={Number(offer?.price)} final={offer.offerPrice} />
                                            </Row>

                                            <Divider />

                                            <Row>
                                                <img src={whatsappIcon} alt="whatsapp" className="w-12 h-12" />
                                                <AnimatedButton
                                                    buttonText="Contact us"
                                                    className="w-3/4 hover:bg-custom-black"
                                                    borderButtonColor="bg-white"
                                                    textColor="text-white"
                                                    bgColor="bg-custom-black"
                                                />
                                            </Row>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

function getOfferDetailsConfig(offer: any) {
    return [
        { icon: dateIcon, label: offer.days },
        { icon: star, label: offer.rating },
    ];
}

function Row({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center justify-between gap-4">{children}</div>;
}

function Divider() {
    return <div className="w-full h-[2px] bg-gray-300" />;
}

function IconText({ icon, text }: { icon: string; text: string }) {
    return (
        <div className="flex items-center gap-3">
            <img src={icon} alt="" />
            <h3>{text}</h3>
        </div>
    );
}

function PriceStrike({ original, final }: { original: number | string; final: number | string }) {
    return (
        <span className="flex items-center text-lg">
            <span className="relative inline-block text-base mr-2">
                {original}
                <span className="absolute top-1/2 right-0 w-full h-[3px] bg-red-500 rotate-[10deg]" />
            </span>
            <span className="sm:text-lg font-semibold">{final}</span>
        </span>
    );
}
