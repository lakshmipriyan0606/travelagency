import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import OuterCarousel from './carousel/ActivitiesCarousel';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BestActivitiesSection() {
    return (
        <div className="bg-custom-black relative text-white border-b-4 border-primary overflow-hidden">
            <div className='main__container_space relative z-10'>
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="main_title mb-0 leading-none">
                        Best <span className='
                   text-primary'>Activities!</span>
                    </h1>

                    <Link 
                        to="/activities" 
                        className="group flex items-center gap-3 text-primary hover:text-white font-bold tracking-[0.25em] uppercase transition-all duration-300"
                    >
                        <span className="text-[12px] md:text-sm border-b border-primary/40 group-hover:border-primary pb-0.5">
                            VIEW ALL ACTIVITIES
                        </span>
                        <div className="w-8 h-8 rounded-full border border-primary/40 group-hover:bg-primary group-hover:border-primary flex items-center justify-center transition-all duration-300">
                             <ArrowRight size={14} className="group-hover:text-black transition-colors" />
                        </div>
                    </Link>
                </div>


                <OuterCarousel />
            </div>
        </div>
    );
}
