import Footer from '@/components/layout/footer/Footer'
import ItineraryCard from '@/components/layout/ItineraryCard/ItineraryCard'
import ItineraryExpandDay from '@/components/layout/ItineraryCard/ItineraryExpandCard'
import Navbar from '@/components/layout/navbar/Navbar'
import Newsletter from '@/components/layout/newsletter/Newsletter'
import PackageDetailCarousel from '@/components/layout/packageDetailCarousel/PackageDetailCarousel'
import BookingFomField from '@/components/layout/reachus/BookingFomField'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

const PackageDetail = () => {
    const { id } = useParams()
    const { allPackageList } = useSelector((state) => state?.packageList)
    console.log('allPackageList: ', allPackageList);
    const currentPackageList = allPackageList?.find((list) => list?._id === id) || {}
    console.log('currentPackageList: ', currentPackageList);
    console.log('currentId: ', id);

    const [activeTab, setActiveTab] = useState(1);

    const tabberConfig = [
        {
            id: 1,
            text: 'Itineray',
            component: <ItineraryCard currentPackage={currentPackageList} />
        },
        {
            id: 2,
            text: 'Day to Day',
            component: <ItineraryExpandDay currentPackage={currentPackageList} />
        },

    ]

    return (
        <div>
            <Navbar />

            {/* Container */}
            <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-10 gap-30 lg:p-10">

                {/* Left 70% */}
                <div className="lg:col-span-6">
                    <PackageDetailCarousel currentPackage={currentPackageList} />
                    <div className='sm:hidden'>
                        <BookingFomField />
                    </div>

                    <div className="w-full">

                        {/* ----------- TAB BUTTONS ----------- */}
                        <div className="flex pb-2 font-semibold">
                            {tabberConfig.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 ${activeTab === tab.id
                                        ? "bg-primary"
                                        : "bg-gray-200"
                                        } cursor-pointer`}
                                >
                                    {tab.text}
                                </button>
                            ))}
                        </div>

                        {/* ----------- TAB CONTENT ----------- */}
                        <div className="mt-4">
                            {tabberConfig.find((tab) => tab.id === activeTab)?.component}
                        </div>

                    </div>

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
