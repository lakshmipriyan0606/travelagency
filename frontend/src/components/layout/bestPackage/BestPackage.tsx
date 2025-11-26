import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import OuterCarousel from './carousel/OuterCarousel';
import { useNavigate } from 'react-router-dom';

export default function BestPackage() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-custom-black relative text-white main__container_space">
            <div className='container mx-auto px-4 py-4'>
            <div className="mb-4">
                <h1 className="text-3xl sm:text-5xl font-bold mb-2">
                    Welcome to  <span className='
                   text-primary'>Sastikaa Travels!</span>
                </h1>
            </div>

            <OuterCarousel />

            <div className="text-center mt-12 text-primary/80 hover:text-primary cursor-pointer font-semibold tracking-[0.35em] uppercase" onClick={()=>navigate('/allpackage')}>
                    VIEW ALL 
            </div>
        </div>
        </div>
    );
}
