
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import arrowLeft from "@/assets/icons/leftarrow.svg";
import arrowRight from "@/assets/icons/rightarrow.svg";
import { useNavigate } from "react-router-dom";

interface InnerCarouselProps {
    images: string[];
    offerId: number | string;
}

export default function InnerCarousel({ images = [], offerId }: InnerCarouselProps) {
    const navigate = useNavigate();

    const handleNavigation = (id: number | string) => {
        navigate(`/package/${id}`);
    };

    const enableLoop = images.length > 1;

    return (
        <div className="relative">
            <div>
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        nextEl: `.inner-next-${offerId}`,
                        prevEl: `.inner-prev-${offerId}`,
                    }}
                    autoplay={enableLoop ? { delay: 2000 } : false}
                    loop={enableLoop}
                    slidesPerView={1}
                    className="h-64 md:h-72"
                >
                    {images.map((img, idx) => (
                        <SwiperSlide key={idx} className="h-full">
                            <div
                                className="h-full w-full bg-cover bg-center relative flex cursor-pointer rounded-t-lg "
                                style={{ backgroundImage: `url("${img}")` }}
                                onClick={() => handleNavigation(offerId)}
                            >

                                {/* ---------- EXCLUSIVE OFFER BAR (bottom) ---------- */}


                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                {/* <div className="bottom-2 left-0 right-0 h-6 bg-gradient-to-r from-[#C59435] via-[#F3E79B] to-[#C59435] border-y border-[#D8C27A] flex items-center justify-center shadow-md">
                    <span className="text-black font-semibold tracking-[0.35em] uppercase">
                        Exclusive Offer
                    </span>
                </div> */}
            </div>

            {/* Inner navigation arrows */}
            <button
                className={`inner-prev-${offerId} cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 p-2 rounded-full z-10 transition`}
            >
                <img src={arrowLeft} alt="Prev" className="w-10 h-10" />
            </button>

            <button
                className={`inner-next-${offerId} cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 p-2 rounded-full z-10 transition`}
            >
                <img src={arrowRight} alt="Next" className="w-10 h-10" />
            </button>
        </div>
    );
}


