
import HeroSectionVideoClip from "@/assets/video/hero.mp4"
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton"

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
            <div className="hero-overlay text-white text-4xl sm:text-5xl text-wrap text-center">
                <h1 className="hero-title font-arizonia">Experience <span className="text-primary">Singapore</span> Like Never Before, Adventure Awaits <span className="text-primary">Everywhere!</span></h1>
                <AnimatedButton buttonText="ENQUIRE NOW"  borderButtonColor={'bg-custom-black'}/>
            </div>

        </div>
    )
}

export default HeroSection