import { GetCurrentPackageDetail } from '@/api/admin/auth.api'
import ItineraryCard from '@/components/layout/ItineraryCard/ItineraryCard'
import ItineraryExpandDay from '@/components/layout/ItineraryCard/ItineraryExpandCard'
import PackageDetailCarousel from '@/components/layout/packageDetailCarousel/PackageDetailCarousel'
import BookingFomField from '@/components/layout/reachus/BookingFomField'
import { UseFetchAPIQuery } from '@/Hook/UseFetchAPIQuery'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb'

import noDataImg from '@/assets/image/no-data-clean.png'

const PackageDetail = () => {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const [searchParams] = useSearchParams();
    // Support both /package/:id (old) and /package/:name?id=... (new) formats
    const id = searchParams.get('id') || paramId;

    const { data: currentPackageList, isLoading } = UseFetchAPIQuery({
        key: ["currentPackageDetail", { id }],
        queryFn: async () => GetCurrentPackageDetail(id),
    });

    const [activeTab, setActiveTab] = useState(1);
    const pkg = currentPackageList?.data;

    const tabberConfig = [
        {
            id: 1,
            text: 'Itineray',
            component: <ItineraryCard currentPackage={pkg} />
        },
        {
            id: 2,
            text: 'Day to Day',
            component: <ItineraryExpandDay currentPackage={pkg} />
        },
    ]

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const packageName = pkg?.packageName;
    const packageType = pkg?.packageType;

    const Skeleton = ({ className }: { className?: string }) => (
        <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
    );

    return (
        <div>
            {/* Breadcrumb */}
            <div className="px-4 sm:px-8 lg:px-8 pt-20 sm:pt-24">
                <Breadcrumb
                    items={[
                        { label: "Home", href: "/" },
                        { label: "All Packages", href: "/allpackage" },
                        ...(packageType ? [{ label: packageType }] : (isLoading ? [{ label: "Loading..." }] : [])),
                        ...(packageName ? [{ label: packageName }] : []),
                    ]}
                    className="text-gray-300"
                />
            </div>


            <div className={`font-body mt-8 bg-white/50 px-6 rounded-2xl border border-gray-100 ${!isLoading && !pkg ? 'flex justify-center' : ''}`}>
                {isLoading ? (
                    <Skeleton className="h-10 w-3/4 mb-2 mt-2" />
                ) : !pkg ? (
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-bold text-2xl lg:text-4xl text-red-600 border-x-4 border-red-500 px-10 py-3 italic font-black text-center tracking-tighter'
                    >
                        Package Not Found
                    </motion.h1>
                ) : (
                    <h1 className='text-bold text-2xl lg:text-3xl text-gray-900 border-l-4 border-primary pl-4'>
                        {packageName}
                    </h1>
                )}
            </div>

            {/* Container */}
            <div className={`mx-auto p-4 lg:p-8 ${!isLoading && !pkg ? 'flex flex-col items-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-8'}`}>
                {/* Left 66% or Full Width - Main Content & Image */}
                <div className={`${!isLoading && !pkg ? 'w-full max-w-3xl' : 'lg:col-span-8'} pt-10 sm:pt-0`}>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-[400px] w-full" />
                            <Skeleton className="h-10 w-1/4" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    ) : !pkg ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-12 bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] px-8 text-center"
                        >
                            <motion.div
                                animate={{ y: [0, -12, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="mb-6 relative"
                            >
                                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                                <img
                                    src={noDataImg}
                                    alt="No Data"
                                    className="w-56 h-auto relative z-10 drop-shadow-xl"
                                />
                            </motion.div>

                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                                This package is <span className="text-primary italic">no longer available.</span>
                            </h2>
                            <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-lg font-medium opacity-90">
                                Let’s discover something even better for your next trip.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 mt-14 w-full max-w-lg justify-center">
                                <button
                                    onClick={() => navigate('/allpackage')}
                                    className="px-10 py-5 bg-primary text-black font-black rounded-2xl hover:bg-opacity-90 transition-all shadow-[0_15px_35px_rgba(242,193,46,0.4)] active:scale-95 uppercase tracking-extrawide text-sm whitespace-nowrap cursor-pointer"
                                >
                                    Explore All Packages
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-10 py-5 bg-white text-slate-800 border-2 border-slate-100 font-black rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 uppercase tracking-extrawide text-sm whitespace-nowrap cursor-pointer"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <PackageDetailCarousel currentPackage={currentPackageList} />

                            {/* Mobile Only Header/Booking */}
                            <div className='lg:hidden mt-2'>
                                <BookingFomField fieldClassName="text-gray-200 sm:text-gray-800" />
                            </div>

                            <div className='font-body bg-white/50 rounded-2xl border border-gray-100'>
                                <p className='text-gray-600 leading-relaxed text-[15px]'>
                                    {pkg?.packageDescription}
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
                        </>
                    )}

                </div>

                {/* Right 33% - Sticky Booking Form */}
                {pkg && (
                    <div className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-22 bg-white rounded-2xl border border-gray-100">
                            <div className='font-body text-center'>
                                <h1 className='text-gray-800 text-xl font-bold p-3'>Book your dream vacation <span className='text-primary font-medium'>Today!</span></h1>
                            </div>
                            <BookingFomField fieldClassName="text-gray-200 sm:text-gray-800" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PackageDetail;
