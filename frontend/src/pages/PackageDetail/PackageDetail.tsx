import Footer from '@/components/layout/footer/Footer'
import ItineraryCard from '@/components/layout/ItineraryCard/ItineraryCard'
import ItineraryExpandDay from '@/components/layout/ItineraryCard/ItineraryExpandCard'
import Navbar from '@/components/layout/navbar/Navbar'
import Newsletter from '@/components/layout/newsletter/Newsletter'
import PackageDetailCarousel from '@/components/layout/packageDetailCarousel/PackageDetailCarousel'
import BookingFomField from '@/components/layout/reachus/BookingFomField'

const PackageDetail = () => {
    return (
        <div>
            <Navbar />

            {/* Container */}
            <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-10 gap-30 lg:p-10">

                {/* Left 70% */}
                <div className="lg:col-span-6">
                    <PackageDetailCarousel />
                    <div className='sm:hidden'>
                        <BookingFomField />
                    </div>
                    <ItineraryCard />
                    <ItineraryExpandDay />
                </div>

                {/* Right 30% Sticky */}
                <div className=" hidden sm:block lg:col-span-4">
                    <div className="sticky top-20 bg-white shadow-lg rounded-lg p-6">
                        <BookingFomField />
                    </div>
                </div>
            </div>
            <Newsletter />
            <Footer />
        </div>
    )
}

export default PackageDetail;
