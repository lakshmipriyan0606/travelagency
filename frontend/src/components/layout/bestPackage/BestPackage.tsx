import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import OuterCarousel from './carousel/OuterCarousel';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BestPackage() {

    return (
        <div className=" bg-custom-black relative text-white border-b-4 border-primary overflow-hidden">
            <div className='absolute z-0 inset-0 w-full h-full pointer-events-none'>
                {/* <img src={Auroplane} alt="Airplane path graphic" className="w-full h-full object-cover object-right-top" /> */}
            </div>
            <div className='main__container_space relative z-10'>
                <div className="mb-8 flex flex-col items-center justify-center text-center gap-4">
                    <h1 className="main_title mb-0 leading-none">
                        Best <span className='text-primary'>Packages!</span>
                    </h1>
                </div>

                <OuterCarousel />

                <div className="flex justify-center">
                    <Link
                        to="/allpackage"
                        className="group flex items-center gap-3 text-primary hover:text-white font-bold tracking-[0.25em] uppercase transition-all duration-300"
                    >
                        <span className="text-[12px] md:text-sm border-b border-primary/40 group-hover:border-primary pb-0.5">
                            VIEW ALL PACKAGES
                        </span>
                        <div className="w-10 h-10 rounded-full border border-primary/40 group-hover:bg-primary group-hover:border-primary flex items-center justify-center transition-all duration-300">
                            <ArrowRight size={18} className="group-hover:text-black transition-colors" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
