/**
 * HeroSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Desktop  : left 55% = text + CTA  |  right 45% = HeroEnquiryForm card
 * Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import HeroEnquiryForm from './HeroEnquiryForm';
import { HeroFormData } from '@/config/formConfig';
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton';
import { motion } from 'framer-motion';
import { UseFetchAPIQuery } from '@/Hook/UseFetchAPIQuery';
import { GetActiveWebsiteHero } from '@/api/admin/websiteHero.api';

const fallbackHeroImages = [
    { url: "https://i.postimg.cc/4d2180r1/Whats_App_Image_2026_03_19_at_12_02_47_AM.jpg", alt: "Malaysia travel experience" },
    { url: "https://i.postimg.cc/NMCxNnWD/Whats_App_Image_2026_03_19_at_12_03_28_AM.jpg", alt: "Malaysia tour packages" },
    { url: "https://i.postimg.cc/QtYq6zRk/Whats_App_Image_2026_03_19_at_12_04_07_AM.jpg", alt: "Travel in Malaysia" },
];

// ... Scroll indicator ...
// const ScrollIndicator = () => {
//     const handleScroll = () => {
//         window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
//     };

//     return (
//         <div className="cursor-pointer z-10 absolute left-[40%] sm:left-[40%] md:left-[37%] rotate-90 scale-150 top-[72%] sm:top-[74%] lg:top-[75%] lg:left-[45%]" onClick={handleScroll}>
//             <svg
//                 className="scroll-group"
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="74"
//                 height="40"
//                 viewBox="0 0 74 40"
//             >
//                 <g>
//                     <circle className="circle-static" fill="none" cx="71%" cy="50%" r="24%" />
//                     <circle className="circle-animated" fill="none" strokeWidth="2" cx="71%" cy="50%" r="24%" />
//                 </g>
//                 <polygon
//                     className="scroll-arrow"
//                     points="
//             49.525,14.265 48.898,15.044 54.481,19.541
//             6.444,19.541 6.444,20.541 54.464,20.541
//             48.901,24.954 49.522,25.737 56.7,20.044
//           "
//                 />
//                 <defs>
//                     <linearGradient id="scroll-gradient" x1="100%" y1="50%" x2="0%" y2="50%">
//                         <stop offset="0%" stopOpacity="0.3" />
//                         <stop offset="100%" stopOpacity="1" />
//                     </linearGradient>
//                 </defs>
//             </svg>
//         </div>
//     );
// };


// ─── HeroSection ──────────────────────────────────────────────────────────────

const HeroSection = () => {
    const handleFormComplete = (_data: HeroFormData) => {
        // Form is fully submitted and success message shown.
    };

    const { data: heroCfgData } = UseFetchAPIQuery({
        key: ["websiteHeroActive"],
        queryFn: GetActiveWebsiteHero,
        options: { enabled: true },
    });

    const heroCfg = heroCfgData?.data || {};
    const heroImages: { url: string; alt?: string }[] =
        Array.isArray(heroCfg?.backgroundImages) && heroCfg.backgroundImages.length
            ? heroCfg.backgroundImages
            : fallbackHeroImages;
    const heroTitle = heroCfg?.title || "Best Travel Agency in Malaysia";
    const heroDescription = heroCfg?.description || "Plan your perfect Malaysia trip with Sastikaa Travel — a professional travel agency in Malaysia providing city tours, airport transfers, and customized travel packages across Kuala Lumpur, Genting Highland, Langkawi Island, and Penang.";

    return (
        <div className="relative w-full h-screen overflow-hidden rounded-3xl">
            <style>
                {`
                .custom-hero-pagination {
                    bottom: 40px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: auto !important;
                    z-index: 100 !important;
                    display: flex !important;
                    justify-content: center !important;
                    gap: 8px !important;
                }
                .custom-hero-pagination .swiper-pagination-bullet {
                    background: white !important;
                    opacity: 0.4 !important;
                    width: 12px !important;
                    height: 12px !important;
                    margin: 0 !important;
                    transition: all 0.3s ease !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                    border-radius: 50% !important;
                    border: 1px solid rgba(0,0,0,0.1) !important;
                }
                .custom-hero-pagination .swiper-pagination-bullet-active {
                    background: #f2c12e !important;
                    opacity: 1 !important;
                    transform: scale(1.2) !important;
                }
                `}
            </style>

            {/* Swiper Background */}
            <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={1500}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                pagination={{
                    el: '.custom-hero-pagination',
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet',
                    bulletActiveClass: 'swiper-pagination-bullet-active',
                }}
                className="hero-swiper absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl"
            >
                {heroImages.map((img, index) => (
                    <SwiperSlide key={index}>
                        <div className="relative w-full h-full overflow-hidden">
                            <motion.img
                                src={img.url}
                                alt={img.alt || `Hero ${index + 1}`}
                                className="w-full h-full object-cover"
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 5, ease: "linear" }}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="custom-hero-pagination absolute bottom-10 left-1/2 -translate-x-1/2 z-20"></div>

            <div className="absolute inset-0 bg-black/40 z-10 flex items-center rounded-2xl sm:rounded-3xl pointer-events-none">
                <div className="w-full h-full flex flex-col md:flex-row items-start md:items-center mt-[38%] md:mt-0 px-6 md:px-12 lg:px-20 gap-6 md:gap-10 pointer-events-auto">
                    <div className="flex flex-col items-start justify-center text-white text-left w-full md:w-[55%] gap-3 md:gap-6 max-w-[19rem] sm:max-w-[22rem] md:max-w-none sm:pb-10 lg:pb-0">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-[1.8rem] sm:text-2xl lg:text-4xl leading-[1.5] sm:leading-[1.8] md:leading-snug font-semibold text-white">
                                {heroTitle.includes("Malaysia") ? (
                                    <>
                                        {heroTitle.replace("Malaysia", "")}
                                        <span className="text-primary">Malaysia</span>
                                    </>
                                ) : (
                                    heroTitle
                                )}
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-200 mt-2 max-w-2xl leading-relaxed">
                                {heroDescription}
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-4 mt-2 pt-4">
                            <AnimatedButton
                                buttonText="EXPLORE PACKAGE"
                                className="!px-10 !py-3.5 w-[200px] h-[45px]"
                                to="/allpackage"
                            />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-center md:pb-22 lg:pb-1 w-full md:w-[45%] lg:w-[40%] self-center">
                        <HeroEnquiryForm onComplete={handleFormComplete} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
