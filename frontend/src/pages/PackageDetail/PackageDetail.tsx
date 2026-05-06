import { GetCurrentPackageDetail } from '@/api/admin/auth.api'
import ItineraryCard from '@/components/layout/ItineraryCard/ItineraryCard'
import ItineraryExpandDay from '@/components/layout/ItineraryCard/ItineraryExpandCard'
import PackageDetailCarousel from '@/components/layout/packageDetailCarousel/PackageDetailCarousel'
import BookingFomField from '@/components/layout/reachus/BookingFomField'
import { UseFetchAPIQuery } from '@/Hook/UseFetchAPIQuery'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb'
import { Helmet } from 'react-helmet-async'

import noDataImg from '@/assets/image/no-data-clean.png'
import SuggestedProducts from '@/components/layout/suggestedProducts/SuggestedProducts'
import { Clock, Zap, ShieldCheck, Globe } from 'lucide-react'

const PackageDetail = () => {

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
            {pkg && (
                <Helmet>
                    <title>{pkg.seo?.title || `${pkg.packageName} | Travel Agency`}</title>
                    <meta name="description" content={pkg.seo?.description || pkg.packageDescription} />
                    <meta name="keywords" content={pkg.seo?.keywords || "travel, tour, adventure"} />
                </Helmet>
            )}
            {/* Breadcrumb */}

            <div className="px-4 sm:px-8 lg:px-8 pt-28 sm:pt-32">
                <Breadcrumb
                    items={[
                        { label: "Home", href: "/" },
                        { label: pkg?.activityCategory ? "All Activities" : "All Packages", href: pkg?.activityCategory ? "/activities" : "/allpackage" },
                        ...(pkg?.activityCategory ? [{ label: pkg.activityCategory }] : (packageType ? [{ label: packageType }] : (isLoading ? [{ label: "Loading..." }] : []))),
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
                        className='text-bold text-2xl lg:text-4xl text-red-600 border-x-4 border-red-500 px-10 py-3 italic  text-center tracking-tighter'
                    >
                        Activity Not Found
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
                <div className={`${!isLoading && !pkg ? 'w-full max-w-3xl' : 'lg:col-span-8'} pt-0 sm:pt-0`}>
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

                            <h2 className="text-3xl lg:text-4xl  text-slate-900 mb-6 tracking-tight leading-tight">
                                This {pkg?.activityCategory ? "activity" : "package"} is <span className="text-primary italic">no longer available.</span>
                            </h2>
                            <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-lg font-medium opacity-90">
                                Let’s discover something even better for your next trip.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 mt-3 w-full max-w-lg justify-center">
                                <Link
                                    to={pkg?.activityCategory ? "/activities" : "/allpackage"}
                                    className="px-10 py-5 bg-primary text-black  rounded-2xl hover:bg-opacity-90 transition-all shadow-[0_15px_35_rgba(242,193,46,0.4)] active:scale-95 uppercase tracking-extrawide text-sm whitespace-nowrap cursor-pointer flex items-center justify-center"
                                >
                                    Explore All {pkg?.activityCategory ? "Activities" : "Packages"}
                                </Link>
                                <Link
                                    to="/"
                                    className="px-10 py-5 bg-white text-slate-800 border-2 border-slate-100  rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 uppercase tracking-extrawide text-sm whitespace-nowrap cursor-pointer flex items-center justify-center"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <PackageDetailCarousel currentPackage={currentPackageList} />

                            {/* Mobile Only Header/Booking */}
                            <div className='lg:hidden mt-2'>
                                <BookingFomField fieldClassName="text-gray-800 sm:text-gray-800 shadow-xl" packageName={packageName} />
                            </div>

                            {pkg && pkg.activityCategory ? (
                                <div className="space-y-8 mt-6 font-body">
                                    {/* Info Bar */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Operating Hours</p>
                                                <p className="text-sm font-semibold text-gray-800">{pkg.operatingHours || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Instant Confirmation</p>
                                                <p className="text-sm font-semibold text-gray-800">{pkg.isInstantConfirmation ? "Instant tour confirmation" : "Confirmation needed"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cancellation</p>
                                                <p className="text-sm font-semibold text-gray-800">{pkg.isNonRefundable ? "Non Refundable" : "Free Cancellation"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <Globe size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Language</p>
                                                <p className="text-sm font-semibold text-gray-800">{pkg.languages || "English"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="bg-white/50 rounded-[2.5rem] border border-gray-100 p-8 lg:p-10 shadow-sm space-y-12">
                                        {/* Overview Section */}
                                        <section>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(252,175,22,0.4)]" />
                                                <h2 className="text-3xl font-heading  text-gray-900 tracking-tight">Overview</h2>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed text-lg text-justify font-medium">
                                                {pkg.packageDescription}
                                            </p>
                                        </section>

                                        {/* Highlights Section */}
                                        {pkg.highlights && pkg.highlights.length > 0 && (
                                            <section>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(252,175,22,0.4)]" />
                                                    <h2 className="text-3xl font-heading text-gray-900 tracking-tight">Highlights</h2>
                                                </div>
                                                <ul className="grid grid-cols-1 gap-y-4 gap-x-8">
                                                    {pkg.highlights.map((highlight: string, idx: number) => (
                                                        <li key={idx} className="flex items-start gap-3 group px-5">
                                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(252,175,22,0.6)] shrink-0 transition-transform group-hover:scale-125" />
                                                            <span className="text-gray-700 text-base">{highlight}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className='font-body bg-white/50 rounded-2xl border border-gray-100 mt-6'>
                                        <p className='text-gray-600 leading-relaxed text-[15px] py-4 text-justify px-4'>
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
                                                    {activeTab === tab.id && (
                                                        <motion.div
                                                            layoutId="activeTab"
                                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                            className="absolute inset-0 bg-primary rounded-md"
                                                        />
                                                    )}
                                                    <span className={`relative z-10 text-black`}>{tab.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-4">
                                            {tabberConfig.find((tab) => tab.id === activeTab)?.component}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                </div>

                {/* Right 33% - Sticky Booking Form */}
                {pkg && (
                    <div className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-22 bg-white rounded-2xl border border-gray-100">
                            <div className='font-body text-center'>
                                <h1 className='text-gray-800 text-xl p-3'>Book your dream {pkg?.activityCategory ? "experience" : "vacation"} <span className='text-primary font-medium'>Today!</span></h1>
                            </div>
                            <BookingFomField fieldClassName="text-gray-200 sm:text-gray-800" packageName={packageName} />
                        </div>
                    </div>
                )}
            </div>

            {/* Suggested Products Section */}
            {pkg && (
                <div className="px-4 sm:px-8 lg:px-12 pb-16">
                    <SuggestedProducts
                        currentPackageId={pkg._id}
                        activityCategory={pkg.activityCategory}
                        packageType={pkg.packageType}
                        location={pkg.location}
                        onlyActivities={!!pkg.activityCategory}
                        excludeActivities={!pkg.activityCategory}
                        title="You might also like"
                    />
                </div>
            )}
        </div>
    )
}

export default PackageDetail;
