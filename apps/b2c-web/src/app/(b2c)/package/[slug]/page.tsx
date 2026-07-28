import { Metadata } from 'next';
import { notFound } from 'next/navigation';
// @ts-ignore
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import PackageDetailCarousel from '@/components/layout/packageDetailCarousel/PackageDetailCarousel';
import BookingFomField from '@/components/layout/reachus/BookingFomField';
import SuggestedProducts from '@/components/layout/suggestedProducts/SuggestedProducts';
import { PackageTabs } from '@/components/layout/packageDetail/PackageClientComponents';
import { Clock, Zap, ShieldCheck, Globe } from 'lucide-react';
import { ENDPOINTS } from '@/lib/endpoints';

async function getPackageDetail(slug: string) {
    try {
        const res = await fetch(ENDPOINTS.server.packageBySlug(slug), { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.data || null;
    } catch (error) {
        console.error("Failed to fetch package", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const pkg = await getPackageDetail(slug);
    if (!pkg) return { title: 'Package Not Found' };

    return {
        title: pkg.seo?.title || `${pkg.packageName} | Travel Agency`,
        description: pkg.seo?.description || pkg.packageDescription,
        keywords: pkg.seo?.keywords || "travel, tour, adventure",
        openGraph: {
            title: pkg.seo?.title || pkg.packageName,
            description: pkg.seo?.description || pkg.packageDescription,
            images: pkg.packageImages?.[0]?.url ? [{ url: pkg.packageImages[0].url }] : [],
        }
    };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const pkg = await getPackageDetail(slug);
    
    if (!pkg) {
        notFound();
    }

    const packageName = pkg.packageName;
    const packageType = pkg.packageType;
    const isActivity = !!pkg.activityCategory;

    return (
        <div>
            {/* Breadcrumb */}
            <div className="px-4 sm:px-8 lg:px-8 pt-28 sm:pt-32">
                <Breadcrumb
                    items={[
                        { label: "Home", href: "/" },
                        { label: isActivity ? "All Activities" : "All Packages", href: isActivity ? "/activities" : "/packages" },
                        ...(isActivity ? [{ label: pkg.activityCategory }] : (packageType ? [{ label: packageType }] : [])),
                        ...(packageName ? [{ label: packageName }] : []),
                    ]}
                    className="text-gray-300"
                />
            </div>

            <div className={`font-body mt-8 bg-white/50 px-6 rounded-2xl border border-gray-100`}>
                <h1 className='text-bold text-2xl lg:text-3xl text-gray-900 border-l-4 border-primary pl-4'>
                    {packageName}
                </h1>
            </div>

            {/* Container */}
            <div className="mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 66% - Main Content & Image */}
                <div className="lg:col-span-8 pt-0 sm:pt-0">
                    <PackageDetailCarousel currentPackage={{ data: pkg }} />

                    {/* Mobile Only Booking */}
                    <div className='lg:hidden mt-2'>
                        <BookingFomField fieldClassName="text-gray-800 sm:text-gray-800 shadow-xl" packageName={packageName} />
                    </div>

                    {isActivity ? (
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
                                <section>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(252,175,22,0.4)]" />
                                        <h2 className="text-3xl font-heading text-gray-900 tracking-tight">Overview</h2>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-lg text-justify font-medium">
                                        {pkg.packageDescription}
                                    </p>
                                </section>

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
                                    {pkg.packageDescription}
                                </p>
                            </div>
                            {/* Client Tabs for Itinerary */}
                            <PackageTabs pkg={pkg} />
                        </>
                    )}
                </div>

                {/* Right 33% - Sticky Booking Form */}
                <div className="hidden lg:block lg:col-span-4">
                    <div className="sticky top-22 bg-white rounded-2xl border border-gray-100">
                        <div className='font-body text-center'>
                            <h1 className='text-gray-800 text-xl p-3'>
                                Book your dream {isActivity ? "experience" : "vacation"} <span className='text-primary font-medium'>Today!</span>
                            </h1>
                        </div>
                        <BookingFomField fieldClassName="text-gray-200 sm:text-gray-800" packageName={packageName} />
                    </div>
                </div>
            </div>

            {/* Suggested Products Section */}
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
        </div>
    );
}
