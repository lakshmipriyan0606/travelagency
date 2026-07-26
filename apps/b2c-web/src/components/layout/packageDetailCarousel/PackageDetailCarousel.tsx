/* eslint-disable */
'use client';
import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useDeviceSize } from "@/Hook/UseDevice";
import type { Swiper as SwiperType } from "swiper";

interface PackageData {
    images?: { url: string; alt: string }[];
}

interface CurrentPackage {
    data?: PackageData;
}

interface PackageDetailCarouselProps {
    currentPackage?: CurrentPackage;
}

export default function PackageDetailCarousel({
    currentPackage,
}: PackageDetailCarouselProps) {
    const images = currentPackage?.data?.images || [];

    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [renderImages, setRenderImages] = useState<{ url: string; alt: string }[]>(images);

    const mainSwiperRef = useRef<SwiperType | null>(null);
    const device = useDeviceSize();

    useEffect(() => {
        if (device === "small") {
            setRenderImages(images.slice(0, 3));
        } else if (device === "medium") {
            setRenderImages(images.slice(0, 4));
        } else {
            setRenderImages(images);
        }
    }, [device, images]);

    // Helper to ensure high quality Cloudinary rendering
    const getOptimizedUrl = (url: string) => {
        if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
        // If it's a raw upload URL, inject quality/format optimizations
        if (url.includes('/upload/') && !url.includes('/upload/q_')) {
            return url.replace('/upload/', '/upload/q_auto:best,f_auto/');
        }
        return url;
    };

    return (
        <div className="w-full max-w-6xl mx-auto swiper-action-white mt-[7%] sm:mt-[0%]">
            {/* MAIN SLIDER */}
            <Swiper
                modules={[Navigation]}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                navigation={true}
                className="rounded-xl overflow-hidden shadow-lg"
            >
                {renderImages.map((img, index) => (
                    <SwiperSlide key={index}>
                        <img
                            src={getOptimizedUrl(typeof img === 'string' ? img : img.url)}
                            alt={typeof img === 'string' ? "" : img.alt}
                            className="w-full h-[580px] md:h-[580px] lg:h-[620px] object-cover"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* THUMBNAILS */}
            <div className="flex justify-center items-center gap-6 mt-6 relative bottom-15 z-10">
                {renderImages.map((img, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setActiveIndex(index);
                            mainSwiperRef.current?.slideTo(index);
                        }}
                        className={`cursor-pointer transition-all duration-300 rounded-full relative overflow-hidden border-3 ${activeIndex === index
                            ? "border-yellow-400 scale-110 bottom-2 sm:bottom-4 shadow-md shadow-black/40 w-14 h-14 sm:w-15 sm:h-15"
                            : "border-black/30 border-1 opacity-60 hover:opacity-100 bottom-2 sm:bottom-4 shadow-md shadow-black/40"
                            }`}
                    >
                        <img
                            src={getOptimizedUrl(typeof img === 'string' ? img : img.url)}
                            alt={typeof img === 'string' ? "" : img.alt}
                            className="w-12 h-12 sm:w-19 sm:h-19 object-cover rounded-full aspect-square"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}



