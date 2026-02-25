import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import { BEST_CITIES } from "./constant";
import badgeBackground from "@/assets/icons/badgeBackground.svg";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BestCities = () => {
  const [isEnd, setIsEnd] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const swiperRef = useRef<any>(null);

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold  mb-16 text-custom-black">
          Best <span className="text-primary">Cities</span>
        </h2>

        <div className="relative group">
          <Swiper
            modules={[Navigation, Scrollbar]}
            spaceBetween={20}
            slidesPerView={1.2}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.5 },
              1280: { slidesPerView: 4.5 },
            }}
            // autoplay={{
            //   delay: 3000,
            //   disableOnInteraction: false,
            // }}
            scrollbar={{
              el: ".custom-scrollbar",
              draggable: true,
            }}
            className="best-cities-swiper !pb-20"
          >
            {BEST_CITIES.map((city) => (
              <SwiperSlide key={city.id}>
                <div className="relative h-[400px] md:h-[450px] rounded-[30px] overflow-hidden shadow-lg group/card cursor-pointer">
                  <img
                    src={city.image}
                    alt={city.name}
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
          </Swiper>

          {/* Navigation and Scrollbar Container */}
          <div className="flex items-center justify-between mt-8 max-w-[300px] mx-auto md:mx-0 md:ml-auto md:mr-4">
            {/* Custom Scrollbar */}
            <div className="flex-1 mr-8">
              <div className="custom-scrollbar h-1 bg-gray-200 rounded-full relative overflow-hidden cursor-pointer">
                <div className="swiper-scrollbar-drag !bg-primary !rounded-full" />
              </div>
            </div>

            {/* Custom Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300  cursor-pointer ${
                  isBeginning 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-[#fff9e6] text-primary hover:bg-primary hover:text-white"
                }`}
                disabled={isBeginning}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300  cursor-pointer ${
                  isEnd 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-[#fff9e6] text-primary hover:bg-primary hover:text-white"
                }`}
                disabled={isEnd}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestCities;
