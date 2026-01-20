import FilterPackage from '@/components/layout/filterPackage/FilterPackage'
import HeroSectionVideoClip from "@/assets/video/hero.mp4"
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton'
import Newsletter from '@/components/layout/newsletter/Newsletter'
import personaliztionBg from '@/assets/icons/bg1.svg'

const AllPackage = () => {
    return (
        <div className="w-full overflow-x-hidden">

            <div className="relative w-full h-[75.5vh] sm:h-[86vh] overflow-hidden">
                <video
                    src={HeroSectionVideoClip}
                    autoPlay
                    loop
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            <div className="bg-custom-black flex flex-col md:flex-row justify-between items-center p-4 md:p-6 gap-4">
                <div className="font-roboto text-white flex flex-col gap-2 text-center md:text-left">
                    <h1 className="text-[18px] md:text-[22px] font-bold">Create your next super hit holiday</h1>
                    <p className="text-gray-300 font-light text-[14px] md:text-[16px] max-w-2xl">
                        Our destination experts can help curate an itinerary exactly for you. Free to connect over a call?
                    </p>
                </div>

                <div className="text-center w-full md:w-auto">
                    <AnimatedButton buttonText="ENQUIRE NOW!" className="w-full md:w-auto" />
                </div>
            </div>

            {/* ✅ FIXED SCROLL + STICKY */}
            <FilterPackage />
            <div
                className="relative w-full h-[60vh] bg-cover bg-center"
                style={{ backgroundImage: `url(${personaliztionBg})` }}
            >
                {/* Black Overlay with Opacity */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">

                    <p className="text-white text-2xl sm:text-3xl md:text-5xl mb-6 leading-relaxed font-arizonia">
                        Personalized Tours to the Highest Standards,
                        <br />
                        Especially for You!
                    </p>

                    <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-black/70 font-bold py-1 px-8 rounded shadow-xl transition duration-300"
                    >
                        Book Your Destination!
                    </button>
                </div>
            </div>
            <Newsletter />
        </div>
    );
};


export default AllPackage
