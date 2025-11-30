
import HeroSectionVideoClip from "@/assets/video/hero.mp4"
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton"

// import { motion } from "framer-motion";
// import ArrowSvg from "@/assets/icons/heroDownArrow.svg";


const ScrollIndicator = () => {
    const handleScroll = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth",
        });
    };
    return (
        <div className="scroll-indicator" onClick={handleScroll}>
            <svg
                className="scroll-group"
                xmlns="http://www.w3.org/2000/svg"
                width="74"
                height="40"
                viewBox="0 0 74 40"
            >
                <g>
                    <circle
                        className="circle-static"
                        fill="none"
                        cx="71%"
                        cy="50%"
                        r="24%"
                    />

                    <circle
                        className="circle-animated"
                        fill="none"
                        strokeWidth="2"
                        cx="71%"
                        cy="50%"
                        r="24%"
                    />
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
            <div className="hero-overlay text-white text-2xl  sm:text-6xl text-wrap text-center pt-20">
                <h1 className="hero-title font-arizonia">Experience <span className="text-primary">Singapore</span> Like Never Before, </h1>
                <h1 className="hero-title font-arizonia">Adventure Awaits <span className="text-primary">Everywhere!</span></h1>
                <AnimatedButton buttonText="ENQUIRE NOW" borderButtonColor={'bg-custom-black'} className="mt-[70px] w-[170px]" />
                <div className="pt-6">
                    <ScrollIndicator />
                </div>
            </div>

        </div >
    )
}

export default HeroSection