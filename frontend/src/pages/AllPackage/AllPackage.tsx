import FilterPackage from '@/components/layout/filterPackage/FilterPackage'
import HeroSectionVideoClip from "@/assets/video/hero.mp4"
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton'
import Newsletter from '@/components/layout/newsletter/Newsletter'
import { footerData } from '@/components/layout/footer/constant'

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
                <div className="font-body text-white flex flex-col gap-2 text-center md:text-left">
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
            {/* Personalized Tours Banner */}
            <div className="bg-custom-black px-4 py-10">
                <div
                    className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl h-[400px] sm:h-[400px]"
                    style={{
                        backgroundImage: `url(${footerData.cta.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Black Overlay */}
                    <div className="absolute inset-0 bg-black/60"></div>

                    <div className="relative z-10 w-full h-full flex items-center px-6 sm:px-12 md:px-20 lg:px-28">
                        <div className="flex flex-col items-start text-left max-w-2xl gap-6">
                            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                                Personalized Tours to the Highest Standards,
                                <br />
                                Especially or You!
                            </h2>

                            <button
                                onClick={() => (window.location.href = footerData.cta.buttonHref)}
                                className="bg-[#FBB03B] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-md shadow-lg transition duration-300 text-sm tracking-widest uppercase mt-4"
                            >
                                ENQUIRE NOW!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Newsletter />
        </div>
    );
};


export default AllPackage
