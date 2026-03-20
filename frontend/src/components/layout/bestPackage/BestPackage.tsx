import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// import Auroplane from '@/assets/icons/Auroplane.svg';
import OuterCarousel from './carousel/OuterCarousel';
import { useNavigate } from 'react-router-dom';
export default function BestPackage() {
    const navigate = useNavigate();

    return (
        <div className=" bg-custom-black relative text-white border-b-4 border-primary overflow-hidden">
            <div className='absolute z-0 inset-0 w-full h-full pointer-events-none'>
                {/* <img src={Auroplane} alt="Airplane path graphic" className="w-full h-full object-cover object-right-top" /> */}
            </div>
            <div className='main__container_space relative z-10'>
                <div className="mb-4">
                    <h1 className="main_title mb-2">
                        Welcome to  <span className='
                   text-primary'>Sastikaa Travels!</span>
                    </h1>
                </div>

                <OuterCarousel />

                <div className="text-center mt-12 text-primary/80 hover:text-primary cursor-pointer font-semibold tracking-[0.35em] uppercase" onClick={() => navigate('/allpackage')}>
                    VIEW ALL
                </div>
            </div>
        </div>
    );
}
