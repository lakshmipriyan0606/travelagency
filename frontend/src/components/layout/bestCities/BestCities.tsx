import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { BEST_CITIES } from "./constant";
import badgeBackground from "@/assets/icons/badgeBackground.svg";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BestCities = () => {

  const swiperRef = useRef<any>(null);

  return (
    <section className="main__container_space">
      <div>
        <h2 className="text-4xl md:text-5xl font-bold  mb-16 text-custom-black">
          Best <span className="text-primary">Cities</span>
        </h2>
        <div className="relative group">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}

            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.5 },
              1280: { slidesPerView: 4.5 },
            }}

            className="best-cities-swiper !pb-20 relative"
          >
            {BEST_CITIES.map((city) => (
              <SwiperSlide key={city.id}>
                <div className="relative h-[400px] md:h-[450px] rounded-[30px] overflow-hidden shadow-lg group/card cursor-pointer">
                  <img
                    src={city.image}
                    alt={city.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop"; // Generic travel fallback
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full flex justify-center px-4">
                    <div className="relative">
                      <img
                        src={badgeBackground}
                        alt="badge"
                        className="w-[180px] h-auto"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-white font-arizonia text-2xl md:text-3xl mt-1 drop-shadow-md">
                        {city.name}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
            {/* Custom Navigation Buttons as Overlays */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 z-10">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[#fff9e6] text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-md cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[#fff9e6] text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-md cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </Swiper>


        </div>
      </div>
    </section>
  );
};

export default BestCities;
