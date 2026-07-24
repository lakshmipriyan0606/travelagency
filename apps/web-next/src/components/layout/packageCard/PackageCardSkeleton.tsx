import Skeleton from 'react-loading-skeleton';

const PackageCardSkeleton = () => {
    return (
        <div className="sm:p-2">
            <div className="relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl text-gray-900 border border-neutral-100/50">
                {/* Image Placeholder - Matching InnerCarousel aspect ratio */}
                <div className="w-full aspect-[4/3] flex-shrink-0">
                    <Skeleton height="100%" containerClassName="h-full block" style={{ borderRadius: 0 }} />
                </div>

                {/* Details Section - Matching p-2 from PackageCard */}
                <div className="flex flex-col justify-center gap-3 p-2">
                    {/* Location & Heart Row */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Skeleton circle height={20} width={20} />
                            <Skeleton height={18} width={120} />
                        </div>
                        <div className="p-2">
                            <Skeleton circle height={24} width={24} />
                        </div>
                    </div>

                    {/* Info Lines (Date, Rating) - Matching getOfferDetailsConfig */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton height={18} width={18} className="rounded-md" />
                            <Skeleton height={16} width={100} />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton height={18} width={18} className="rounded-md" />
                            <Skeleton height={16} width={60} />
                        </div>
                    </div>

                    {/* Pricing & Actions Section - Matching mt-2 gap-3 */}
                    <div className="mt-2 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-4">
                            <Skeleton height={20} width={40} />
                            <div className="flex items-center gap-2">
                                <Skeleton height={16} width={50} />
                                <Skeleton height={24} width={80} />
                            </div>
                        </div>

                        {/* Divider - h-[2px] bg-gray-300 */}
                        <div className="w-full h-[2px] bg-gray-200/80" />

                        {/* Button Row - Matching flex-col sm:flex-row gap-4 mt-2 */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-2 mb-1">
                            <div className="flex items-center justify-center sm:justify-start">
                                <Skeleton circle height={44} width={44} />
                            </div>
                            <div className="flex-1">
                                <Skeleton height={44} className="rounded-xl" width="100%" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageCardSkeleton;
