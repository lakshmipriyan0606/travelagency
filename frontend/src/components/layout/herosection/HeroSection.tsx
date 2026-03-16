/**
 * HeroSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Desktop  : left 55% = text + CTA  |  right 45% = HeroEnquiryForm card
 * Mobile   : full-width text + "ENQUIRE NOW" button → opens EnquiryModal
 * ─────────────────────────────────────────────────────────────────────────────
 */

import HeroEnquiryForm from './HeroEnquiryForm';
import { HeroFormData } from '@/config/formConfig';
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ... Scroll indicator (unchanged) ...

const ScrollIndicator = () => {
    const handleScroll = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <div className="cursor-pointer z-10 absolute left-[40%] sm:left-[40%] md:left-[37%] rotate-90 scale-150 top-[72%] sm:top-[74%] lg:top-[75%] lg:left-[45%]" onClick={handleScroll}>
            <svg
                className="scroll-group"
                xmlns="http://www.w3.org/2000/svg"
                width="74"
                height="40"
                viewBox="0 0 74 40"
            >
                <g>
                    <circle className="circle-static" fill="none" cx="71%" cy="50%" r="24%" />
                    <circle className="circle-animated" fill="none" strokeWidth="2" cx="71%" cy="50%" r="24%" />
                </g>
                <polygon
                    className="scroll-arrow"
                    points="
            49.525,14.265 48.898,15.044 54.481,19.541
            6.444,19.541 6.444,20.541 54.464,20.541
            48.901,24.954 49.522,25.737 56.7,20.044
          "
                />
                <defs>
                    <linearGradient id="scroll-gradient" x1="100%" y1="50%" x2="0%" y2="50%">
                        <stop offset="0%" stopOpacity="0.3" />
                        <stop offset="100%" stopOpacity="1" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};


// ─── HeroSection ──────────────────────────────────────────────────────────────

const HeroSection = () => {
    const navigate = useNavigate();

    const handleFormComplete = (_data: HeroFormData) => {
        // Form is fully submitted and success message shown.
    };

    return (
        <div className="relative w-full h-screen overflow-hidden p-10 rounded-2xl">
            {/* <video className="absolute inset-0 w-full h-full object-cover rounded-2xl" src={HeroSectionVideoClip} autoPlay loop muted playsInline /> */}
            <motion.img
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                src={'https://i.postimg.cc/Pqjn2TdS/view-world-monument-celebrate-world-heritage-day.jpg'}
                initial={{ scale: 1 }}
                animate={{ scale: 1.3 }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                }}
            />

            <div className="absolute inset-0 bg-black/50 z-10 flex items-center rounded-2xl">
                <div className="w-full h-full flex flex-col md:flex-row items-start md:items-center mt-[38%] md:mt-0 px-6 md:px-12 lg:px-20 gap-6 md:gap-10 rounded-2xl">
                    <div className="flex flex-col items-start justify-center text-white text-left w-full md:w-[55%] gap-3 md:gap-6 max-w-[19rem] sm:max-w-[22rem] md:max-w-none sm:pb-10 lg:pb-0">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-[1.8rem] sm:text-2xl lg:text-4xl leading-[1.5] sm:leading-[1.8] md:leading-snug font-semibold text-white">
                                Best Travel Agency in <span className="text-primary">Malaysia</span>
                            </h1>
                            <p className="text-[1.8rem] sm:text-2xl lg:text-4xl leading-[1.5] sm:leading-[1.8] md:leading-snug font-semibold text-white">
                                For <span className="text-primary">Personalized Trips</span>
                            </p>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-200 mt-2 max-w-2xl leading-relaxed">
                                Plan your perfect Malaysia trip with <span className="text-primary font-medium">Sastikaa Travel</span> — a professional travel agency in Malaysia providing city tours, airport transfers, and customized travel packages across Kuala Lumpur, Genting Highland, Langkawi Island, and Penang.
                            </p>
                        </div>
                        <div className="flex flex-col items-start gap-4 mt-2 pt-4">
                            <AnimatedButton
                                buttonText="EXPLORE PACKAGE"
                                className="!px-10 !py-3.5 w-[200px] h-[45px] rounded-sm"
                                onClick={() => navigate('/allpackage')}
                            />

                            <div className="">
                                <ScrollIndicator />
                            </div>
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
