import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useDeviceSize } from "@/Hook/UseDevice";
import type { Swiper as SwiperType } from 'swiper';

const images = [
    'https://picsum.photos/1200/800?random=2',
    'https://picsum.photos/1200/800?random=9',
    'https://picsum.photos/1200/800?random=8',
    'https://picsum.photos/1200/800?random=7',
    'https://picsum.photos/1200/800?random=86',
];


export default function PackageDetailCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [renderImages, setRenderImages] = useState(images);
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

    }, [device]);



    return (
        <div className="w-full max-w-6xl mx-auto swiper-action-white">
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
                            src={img}
                            className="w-full h-[350px] md:h-[500px] object-cover"
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
                            (mainSwiperRef.current as any)?.slideTo(index);
                        }}
                        className={`cursor-pointer transition-all duration-300 rounded-full  relative  overflow-hidden border-4 ${activeIndex === index
                            ? "border-yellow-400 scale-110 bottom-2 sm:bottom-5"
                            : "border-transparent border-2 opacity-60 hover:opacity-90 blur-[1px] "
                            } `}
                    >
                        <img
                            src={img}
                            className="w-12 h-12 sm:w-15 sm:h-15 object-cover rounded-full aspect-square"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
