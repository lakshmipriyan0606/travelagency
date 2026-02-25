import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TRAVEL_EXPERIENCES } from "./constant";
import quoteIcon from "@/assets/icons/quoteIcon.svg";

const TravelExperiences = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  const handlePrev = () => swiperRef.current?.slidePrev();
  const handleNext = () => swiperRef.current?.slideNext();

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      {/* Large Quote Icon Background - Positioned as per image */}
      <div className="absolute top-0 left-[-20px] opacity-10 select-none pointer-events-none z-0">
        <img src={quoteIcon} alt="quote" className="w-64 h-64 md:w-96 md:h-96" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Content */}
          <div className="lg:w-[30%] pt-16 z-20">
            <h3 className="font-allura text-[#FCAF16] text-3xl md:text-5xl mb-4">
              Our Customers Love
            </h3>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2B2B2B] mb-8 leading-tight">
              Travel <br /> Experiences
            </h2>
            <p className="text-[#666666] mb-10 max-w-sm leading-relaxed font-roboto text-sm md:text-base">
              Discover what our valued customers have to say about their unforgettable experiences. 
              Read genuine reviews and testimonials showcasing the joy and satisfaction of their journeys with us.
            </p>

            <div className="flex flex-wrap items-center gap-8">
              <button className="bg-[#FFAE00] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-opacity-90 transition-all shadow-lg shadow-orange-100">
                View more Reviews
              </button>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-[#4285F4] text-xl tracking-tight">G</span>
                  <span className="font-bold text-[#EA4335] text-xl tracking-tight">o</span>
                  <span className="font-bold text-[#FBBC05] text-xl tracking-tight">o</span>
                  <span className="font-bold text-[#4285F4] text-xl tracking-tight">g</span>
                  <span className="font-bold text-[#34A853] text-xl tracking-tight">l</span>
                  <span className="font-bold text-[#EA4335] text-xl tracking-tight mr-1">e</span>
                  <span className="text-[#999999] text-xs font-medium uppercase tracking-wider">Reviews</span>
                </div>
                <div className="flex text-[#FCAF16] text-[10px] gap-0.5">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Swiper Section with Peeking Effect */}
          <div className="lg:w-[70%] w-full">
            <div className="relative">
              <Swiper
                modules={[Navigation]}
                spaceBetween={40}
                slidesPerView={1}
                breakpoints={{
                  768: { slidesPerView: 1.1 },
                  1024: { slidesPerView: 1.2 },
                }}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                onBeforeInit={(swiper) => {
                  swiperRef.current = swiper;
                }}
                className="testimonial-swiper"
              >
                {TRAVEL_EXPERIENCES.map((exp, idx) => {
                  const nextExp = TRAVEL_EXPERIENCES[(idx + 1) % TRAVEL_EXPERIENCES.length];
                  
                  return (
                    <SwiperSlide key={exp.id}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 md:gap-y-0 py-8 px-2">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-6">
                          {/* Image Card (Top) */}
                          <div className="h-48 md:h-64 rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white flex-shrink-0">
                            <img src={exp.image} alt={exp.name} className="w-full h-full object-cover" />
                          </div>
                          
                          {/* Text Card (Bottom) */}
                          <div className="bg-white p-8 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-300 flex flex-col h-[280px] md:h-[350px]">
                            <p className="text-[#666666] text-sm md:text-base italic font-roboto leading-relaxed overflow-y-auto custom-scrollbar pr-2">
                              "{exp.text}"
                            </p>
                            <div className="flex items-center gap-4 mt-auto pt-6 bg-white z-10">
                              <img src={exp.avatar} alt={exp.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                              <span className="font-bold text-[#2B2B2B] text-base truncate">{exp.name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2 (Staggered) */}
                        <div className="flex flex-col gap-6 md:mt-20">
                          {/* Text Card (Top) */}
                          <div className="bg-white p-8 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-300 flex flex-col h-[280px] md:h-[320px]">
                            <p className="text-[#666666] text-sm md:text-base italic font-roboto leading-relaxed overflow-y-auto custom-scrollbar pr-2">
                              "{nextExp.text}"
                            </p>
                            <div className="flex items-center gap-4 mt-auto pt-6 bg-white z-10">
                              <img src={nextExp.avatar} alt={nextExp.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                              <span className="font-bold text-[#2B2B2B] text-base truncate">{nextExp.name}</span>
                            </div>
                          </div>

                          {/* Image Card (Bottom) */}
                          <div className="h-48 md:h-64 rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white flex-shrink-0">
                            <img src={nextExp.image} alt={nextExp.name} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {/* White Fade Overlay on the Right */}
              <div className="absolute top-0 right-[-10%] w-[40%] h-full bg-gradient-to-l from-white via-white/80 to-transparent z-30 pointer-events-none hidden lg:block" />
            </div>
          </div>
        </div>

        {/* Custom Navigation and Progress Bar - Aligned as per image */}
        <div className="flex items-center justify-center md:justify-end gap-12 mt-4 md:mr-32">
          <div className="flex items-center gap-6">
            <span className="text-[#FCAF16] font-bold text-lg">
              {String(activeIndex + 1).padStart(2, '0')}/{String(TRAVEL_EXPERIENCES.length).padStart(2, '0')}
            </span>
            <div className="w-64 h-[2px] bg-gray-200 relative rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-[#FCAF16]"
                initial={false}
                animate={{ width: `${((activeIndex + 1) / TRAVEL_EXPERIENCES.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex gap-5">
            <button
              onClick={handlePrev}
              className="w-14 h-14 rounded-full flex items-center justify-center text-[#FCAF16] hover:bg-[#FCAF16] hover:text-white transition-all bg-[#FFF7E6] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={activeIndex === 0}
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={handleNext}
              className="w-14 h-14 rounded-full flex items-center justify-center text-[#FCAF16] hover:bg-[#FCAF16] hover:text-white transition-all bg-[#FFF7E6] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer"
              disabled={activeIndex === TRAVEL_EXPERIENCES.length - 1}
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelExperiences;