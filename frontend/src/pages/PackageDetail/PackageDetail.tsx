import { GetCurrentPackageDetail } from '@/api/admin/auth.api'
import Footer from '@/components/layout/footer/Footer'
import ItineraryCard from '@/components/layout/ItineraryCard/ItineraryCard'
import ItineraryExpandDay from '@/components/layout/ItineraryCard/ItineraryExpandCard'
import Navbar from '@/components/layout/navbar/Navbar'
import Newsletter from '@/components/layout/newsletter/Newsletter'
import PackageDetailCarousel from '@/components/layout/packageDetailCarousel/PackageDetailCarousel'
import BookingFomField from '@/components/layout/reachus/BookingFomField'
import { UseFetchAPIQuery } from '@/Hook/UseFetchAPIQuery'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
const PackageDetail = () => {
    const { id } = useParams()


    const { data: currentPackageList } = UseFetchAPIQuery({
        key: ["currentPackageDetail", { id }],
        queryFn: async () => GetCurrentPackageDetail(id),
    });

    const [activeTab, setActiveTab] = useState(1);


    const tabberConfig = [
        {
            id: 1,
            text: 'Itineray',
            component: <ItineraryCard currentPackage={currentPackageList?.data} />
        },
        {
            id: 2,
            text: 'Day to Day',
            component: <ItineraryExpandDay currentPackage={currentPackageList?.data} />
        },

    ]

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    return (
        <div>

            {/* Container */}
            <div className="mx-auto p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left 66% - Main Content & Image */}
                <div className="lg:col-span-8">
                    <PackageDetailCarousel currentPackage={currentPackageList} />

                    {/* Mobile Only Header/Booking */}
                    <div className='lg:hidden mt-6'>
                        <div className='font-roboto text-center'>
                            <h1 className='text-bold text-2xl pb-2'>{currentPackageList?.data?.packageName}</h1>
                            <h6 className='pb-6'>Book your dream vacation <span className='text-primary'>Today!</span></h6>
                        </div>
                        <BookingFomField />
                    </div>

                    <div className='font-roboto mt-7'>
                        <h1 className='text-bold text-xl'>{currentPackageList?.data?.packageName}</h1>
                        <p className='mt-5 text-sm'>{currentPackageList?.data?.packageDescription}</p>
                    </div>

                    <div className="w-full py-9">

                        {/* ----------- TAB BUTTONS ----------- */}
                        <div className="flex pb-2 font-semibold bg-gray-200 rounded-lg p-1 w-fit">
                            {tabberConfig.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="relative px-4 py-2 cursor-pointer"
                                >
                                    {/* Animated Active Background */}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="absolute inset-0 bg-primary rounded-md"
                                        />
                                    )}

                                    {/* Tab Text */}
                                    <span
                                        className={`relative z-10 text-black`}
                                    >
                                        {tab.text}
                                    </span>
                                </button>
                            ))}
                        </div>


                        {/* ----------- TAB CONTENT ----------- */}
                        <div className="mt-4">
                            {tabberConfig.find((tab) => tab.id === activeTab)?.component}
                        </div>

                    </div>

                </div>

                {/* Right 33% - Sticky Booking Form */}
                <div className="hidden lg:block lg:col-span-4">
                    <div className="sticky top-28 bg-white rounded-2xl border border-gray-100">
                        <div className='font-roboto text-center mb-6'>
                            <h1 className='text-bold text-2xl pb-2'>{currentPackageList?.data?.packageName}</h1>
                            <h6 className='text-gray-800'>Book your dream vacation <span className='text-primary font-medium'>Today!</span></h6>
                        </div>
                        <BookingFomField />
                    </div>
                </div>
            </div>
            <Newsletter />
        </div>
    )
}

export default PackageDetail;
