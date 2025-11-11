import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import OuterCarousel from './carousel/OuterCarousel';

export default function BestPackage() {
    return (
        <div className="min-h-screen bg-custom-black relative text-white py-12 lg:py-5 px-4">
            <div className="mb-4">
                <h1 className="text-3xl sm:text-5xl font-bold mb-2">
                    Welcome to  <span className='
                   text-primary'>Sastikaa Travels!</span>
                </h1>
            </div>

            <OuterCarousel />

            <div className="text-center mt-12">
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold transition">
                    VIEW ALL DESTINATIONS
                </button>
            </div>
        </div>
    );
}
