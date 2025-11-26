
import HeroSectionVideoClip from "@/assets/video/hero.mp4"
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton"

import { motion } from "framer-motion";
import ArrowSvg from "@/assets/icons/heroDownArrow.svg";

const ScrollIndicator = () => {
    const handleScroll = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth",
        });
    };
    return (
        <motion.div
            initial={{ y: -10, scale: 0.9, opacity: 0.8 }} // Smaller and slightly up
            animate={{ y: 10, scale: 1.1, opacity: 1 }}    // Larger and slightly down
            transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
            }}
            onClick={handleScroll}
            className="mx-auto cursor-pointer"
        >
            <img src={ArrowSvg} alt="scroll-down" className="w-[120px] h-[120px] scrolldown" />
        </motion.div>
    );
};


const HeroSection = () => {
    return (
        <div className="hero-container">
            <video
                className="hero-video"
                src={HeroSectionVideoClip}
                autoPlay
                loop
                muted
            />
            <div className="hero-overlay text-white text-xl  sm:text-5xl text-wrap text-center pt-20">
                <h1 className="hero-title font-arizonia">Experience <span className="text-primary">Singapore</span> Like Never Before, </h1>
                <h1 className="hero-title font-arizonia">Adventure Awaits <span className="text-primary">Everywhere!</span></h1>
                <AnimatedButton buttonText="ENQUIRE NOW" borderButtonColor={'bg-custom-black'} className="mt-[70px]" />
                <div className="pt-6">
                    <ScrollIndicator />
                </div>
            </div>

        </div >
    )
}

export default HeroSection