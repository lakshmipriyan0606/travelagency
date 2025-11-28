import FilterPackage from '@/components/layout/filterPackage/FilterPackage'
import Navbar from '@/components/layout/navbar/Navbar'
import HeroSectionVideoClip from "@/assets/video/hero.mp4"
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton'
import Newsletter from '@/components/layout/newsletter/Newsletter'
import Footer from '@/components/layout/footer/Footer'

const AllPackage = () => {
    return (
        <div>
            <Navbar />

            <div>
                <video
                    src={HeroSectionVideoClip}
                    autoPlay
                    loop
                    muted
                    className='w-full h-[632px] object-cover'
                />
            </div>

            <div className='bg-custom-black flex justify-between items-center p-3'>
                <div className='font-roboto text-white flex flex-col gap-2'>
                    <h1 className='text-[17px]'>Create your next super hit holiday</h1>
                    <p className='text-gray-300 font-light text-[15px]'>Our destination experts can help curate an itinerary exactly for you. Free to connect over a call?</p>
                    <div className='sm:hidden'>
                        <AnimatedButton buttonText='ENQUIRE NOW!' className='' />
                    </div>
                </div>
                <div className='text-center  hidden md:block'>
                    <AnimatedButton buttonText='ENQUIRE NOW!' className='' />
                </div>
            </div>

            <FilterPackage />
            <Newsletter />
            <Footer />
        </div>
    )
}

export default AllPackage
