import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import OuterCarousel from './carousel/OuterCarousel';
import { useNavigate } from 'react-router-dom';
export default function BestPackage() {

    const navigate = useNavigate();

    return (
        <div className=" bg-custom-black relative text-white main__container_space border-b-4 border-primary">
            <div className='main__container_space_nextContainer'>
                <div className='absolute z-10 right-0 top-0 **h-[400px] w-[200px]**'>
                    {/* <img src={aueroplane} alt="Airplane path graphic" className="h-full w-full object-contain" /> */}
                </div>
                <div className="mb-4">
                    <h1 className="text-3xl sm:text-5xl font-bold mb-2">
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
