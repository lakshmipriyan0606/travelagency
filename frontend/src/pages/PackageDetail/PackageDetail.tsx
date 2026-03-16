import { GetCurrentPackageDetail } from '@/api/admin/auth.api'
import ItineraryCard from '@/components/layout/ItineraryCard/ItineraryCard'
import ItineraryExpandDay from '@/components/layout/ItineraryCard/ItineraryExpandCard'
import PackageDetailCarousel from '@/components/layout/packageDetailCarousel/PackageDetailCarousel'
import BookingFomField from '@/components/layout/reachus/BookingFomField'
import { UseFetchAPIQuery } from '@/Hook/UseFetchAPIQuery'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb'

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

    const packageName = currentPackageList?.data?.packageName;
    const packageType = currentPackageList?.data?.packageType;

    return (
        <div>
            {/* Breadcrumb */}
            <div className="px-4 sm:px-8 lg:px-8 pt-20 sm:pt-24">
                <Breadcrumb
                    items={[
                        { label: "Home", href: "/" },
                        { label: "All Packages", href: "/allpackage" },
                        ...(packageType ? [{ label: packageType }] : []),
                        ...(packageName ? [{ label: packageName }] : []),
                    ]}
                    className="text-gray-300"
                />
            </div>


            <div className='font-body mt-8 bg-white/50  px-6  rounded-2xl border border-gray-100'>
                <h1 className='text-bold text-2xl lg:text-3xl text-gray-900 border-l-4 border-primary pl-4'>
                    {currentPackageList?.data?.packageName}
                </h1>
            </div>

            {/* Container */}
            <div className="mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 66% - Main Content & Image */}
                <div className="lg:col-span-8 pt-10 sm:pt-0">
                    <PackageDetailCarousel currentPackage={currentPackageList} />

                    {/* Mobile Only Header/Booking */}
                    <div className='lg:hidden mt-2'>
                        <BookingFomField fieldClassName="text-gray-200 sm:text-gray-800" />
                    </div>

                    <div className='font-body bg-white/50 rounded-2xl border border-gray-100'>
                        <p className='text-gray-600 leading-relaxed text-[15px]'>
                            {currentPackageList?.data?.packageDescription}
                        </p>
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
                    <div className="sticky top-22 bg-white rounded-2xl border border-gray-100">
                        <div className='font-body text-center'>
                            <h6 className='text-gray-800 text-xl'>Book your dream vacation <span className='text-primary font-medium'>Today!</span></h6>
                        </div>
                        <BookingFomField fieldClassName="text-gray-200 sm:text-gray-800" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PackageDetail;
