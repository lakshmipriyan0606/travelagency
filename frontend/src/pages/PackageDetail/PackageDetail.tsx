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
            <Navbar />

            {/* Container */}
            <div className="mx-auto p-4 flex flex-col lg:gap-4 flex-row lg:p-10">

                {/* Left 70% */}
                <div className="">
                    <PackageDetailCarousel currentPackage={currentPackageList} />
                    <div className='lg:hidden'>
                        <BookingFomField />
                    </div>

                    <div className="w-full py-9">

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
                <div className=" hidden lg:block lg:w-[30%]">
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
