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
    <section className="py-4 bg-white overflow-hidden relative">
      {/* Large Quote Icon Background - Positioned as per image */}
      <div className="hidden md:block absolute top-0 -left-[40px] opacity-60 select-none pointer-events-none z-0">
        <img src={quoteIcon} alt="quote" loading="lazy" className="w-64 h-64 md:w-40 md:h-40" />
      </div>

      <div className="hidden md:block absolute top-0 left-[120px] opacity-60 select-none pointer-events-none z-0">
        <img src={quoteIcon} alt="quote" loading="lazy" className="w-64 h-64 md:w-40 md:h-40" />
      </div>


      <div className="max-w-[1440px] mx-auto px-4 md:px-12 relative z-10">
        {/* Mobile Top Heading */}
        <div className="block md:hidden text-center mb-4 pt-4 relative z-20">
          <h3 className="font-allura text-[#FCAF16] text-[30px] sm:text-[40px] leading-[1.2] drop-shadow-sm">
            Our Customers Love
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start lg:items-center">
          {/* Left Content */}
          <div className="w-full md:w-[45%] lg:w-[30%] pt-0 md:pt-16 z-20 order-3 md:order-1 flex flex-col items-center text-center md:items-start md:text-left mt-2 md:mt-0">
            <h3 className="hidden md:block font-allura text-[#FCAF16] text-3xl md:text-5xl mb-4">
              Our Customers Love
            </h3>
            <h2 className="text-[26px] sm:text-3xl md:text-4xl lg:text-5xl font-medium md:font-bold text-[#2B2B2B] mb-4 md:mb-8 leading-tight">
              Travel <span className="text-[#FCAF16] md:text-[#2B2B2B]">Experiences</span>
            </h2>
            <p className="text-[#666666] mb-8 md:mb-10 max-w-[320px] md:max-w-sm leading-relaxed font-roboto text-[11.5px] sm:text-sm md:text-base">
              Discover what our valued customers have to say about their unforgettable experiences.
              Read genuine reviews and testimonials showcasing the joy and satisfaction of their journeys with us.
            </p>

            <div className="flex flex-row flex-wrap lg:flex-nowrap items-center justify-center md:justify-start gap-4 sm:gap-6 md:gap-8 w-full">
              <button className="bg-[#FFAE00] text-white px-6 md:px-8 py-3 rounded-xl text-sm md:text-base font-semibold hover:bg-opacity-90 transition-all shadow-lg shadow-orange-100 whitespace-nowrap">
                View more Reviews
              </button>

              <div className="flex flex-col items-center md:items-start">
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
          <div className="w-full md:w-[55%] lg:w-[70%] min-w-0 order-2 md:order-2 relative">
            <div className="relative px-7 md:px-0">
              {/* Mobile Absolute Arrows */}
              <button
                onClick={handlePrev}
                className="md:hidden absolute left-0 top-[45%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#FFF7E6] text-[#FCAF16] flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={activeIndex === 0}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="md:hidden absolute right-0 top-[45%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#FFF7E6] text-[#FCAF16] flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={activeIndex === TRAVEL_EXPERIENCES.length - 1}
              >
                <ChevronRight size={20} />
              </button>

              <Swiper
                modules={[Navigation]}
                spaceBetween={40}
                slidesPerView={1}
                breakpoints={{
                  768: { slidesPerView: 1.1, spaceBetween: 20 },
                  1024: { slidesPerView: 1.2, spaceBetween: 40 },
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
                      <div className="flex lg:grid lg:grid-cols-2 flex-col gap-x-6 gap-y-6 lg:gap-y-0 py-8 px-2 max-w-sm md:max-w-md lg:max-w-none mx-auto lg:mx-0">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-4 md:gap-6">
                          {/* Image Card (Top) */}
                          <div className="h-40 rounded-2xl md:rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white flex-shrink-0">
                            <img src={exp.image} alt={exp.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>

                          {/* Text Card (Bottom) */}
                          <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-200 md:border-gray-300 flex flex-col h-[230px] sm:h-[260px] md:h-[350px]">
                            <p className="text-[#666666] text-sm md:text-base italic font-roboto leading-relaxed overflow-y-auto custom-scrollbar pr-2">
                              "{exp.text}"
                            </p>
                            <div className="flex items-center gap-4 mt-auto pt-6 bg-white z-10">
                              <img src={exp.avatar} alt={exp.name} loading="lazy" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                              <span className="font-bold text-[#2B2B2B] text-base truncate">{exp.name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2 (Staggered) */}
                        <div className="hidden lg:flex flex-col gap-6 lg:mt-20">
                          {/* Text Card (Top) */}
                          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-300 flex flex-col h-[280px] lg:h-[320px]">
                            <p className="text-[#666666] text-sm md:text-base italic font-roboto leading-relaxed overflow-y-auto custom-scrollbar pr-2">
                              "{nextExp.text}"
                            </p>
                            <div className="flex items-center gap-4 mt-auto pt-6 bg-white z-10">
                              <img src={nextExp.avatar} alt={nextExp.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                              <span className="font-bold text-[#2B2B2B] text-base truncate">{nextExp.name}</span>
                            </div>
                          </div>

                          {/* Image Card (Bottom) */}
                          <div className="h-48 rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white flex-shrink-0">
                            <img src={nextExp.image} alt={nextExp.name} loading="lazy" className="w-full h-full object-cover" />
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

            {/* Mobile Dot Pagination */}
            <div className="flex md:hidden items-center justify-center gap-[5px] mt-6">
              {TRAVEL_EXPERIENCES.map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-[5px] h-[5px] bg-[#FCAF16]' : 'w-[5px] h-[5px] bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Custom Navigation and Progress Bar (Desktop/Tablet) */}
        <div className="hidden md:flex flex-row items-center justify-between lg:justify-end w-full max-w-sm md:max-w-full mx-auto lg:mr-32 gap-4 sm:gap-6 mt-4 px-2">
          {/* Number on left */}
          <span className="text-[#FCAF16] font-bold text-base sm:text-lg whitespace-nowrap">
            {String(activeIndex + 1).padStart(2, '0')}/{String(TRAVEL_EXPERIENCES.length).padStart(2, '0')}
          </span>

          {/* Progress Bar (middle) */}
          <div className="flex-1 max-w-[150px] sm:max-w-[250px] lg:w-64 h-[2px] bg-gray-200 relative rounded-full overflow-hidden flex-shrink-1">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#FCAF16]"
              initial={false}
              animate={{ width: `${((activeIndex + 1) / TRAVEL_EXPERIENCES.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Arrows on Right */}
          <div className="flex gap-2 sm:gap-5 flex-shrink-0">
            <button
              onClick={handlePrev}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-[#FCAF16] hover:bg-[#FCAF16] hover:text-white transition-all bg-[#FFF7E6] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={activeIndex === 0}
            >
              <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-[#FCAF16] hover:bg-[#FCAF16] hover:text-white transition-all bg-[#FFF7E6] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={activeIndex === TRAVEL_EXPERIENCES.length - 1}
            >
              <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelExperiences;
