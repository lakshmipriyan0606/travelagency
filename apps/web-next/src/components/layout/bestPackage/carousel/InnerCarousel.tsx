
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import arrowLeft from "@/assets/icons/leftarrow.svg";
import arrowRight from "@/assets/icons/rightarrow.svg";
import { useRouter } from "next/navigation";

interface InnerCarouselProps {
    images: { url: string; alt: string }[] | string[];
    offerId: number | string;
    packageName?: string;
    isActivity?: boolean;
}


export default function InnerCarousel({ images = [], offerId, packageName, isActivity }: InnerCarouselProps) {
    const router = useRouter();

    const handleNavigation = (id: number | string) => {
        const baseRoute = isActivity ? "/activity" : "/package";
        if (packageName) {
            const slug = packageName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            router.push(`${baseRoute}/${slug}`);
        } else {
            router.push(`${baseRoute}/${id}`);
        }
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
                    {images.map((img: any, idx) => {
                        let imageUrl = "";
                        // let imageAlt = "";

                        if (typeof img === 'string') {
                            imageUrl = img;
                        } else if (img && typeof img === 'object') {
                            // If it's the corrupted format {0: 'h', 1: 't', ...}, recover it
                            if (img[0] === 'h' && !img.url) {
                                imageUrl = Object.values(img).filter(v => typeof v === 'string').join('');
                            } else {
                                imageUrl = img.url || "";
                                // imageAlt = img.alt || "";
                            }
                        }

                        return (
                            <SwiperSlide key={idx} className="h-full">
                                <div
                                    className="h-full w-full bg-cover bg-center relative flex cursor-pointer rounded-t-lg "
                                    style={{ backgroundImage: `url("${imageUrl}")` }}
                                    onClick={() => handleNavigation(offerId)}
                                >

                                    {/* ---------- EXCLUSIVE OFFER BAR (bottom) ---------- */}


                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>


                {
                    !isActivity ? (
                        <div className="bottom-2 left-0 right-0 h-6 bg-gradient-to-r from-[#C59435] via-[#F3E79B] to-[#C59435] border-y border-[#D8C27A] flex items-center justify-center shadow-md">
                            <span className="text-black font-semibold tracking-[0.35em] uppercase">
                                Exclusive Offer
                            </span>
                        </div>
                    ) : null
                }

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



