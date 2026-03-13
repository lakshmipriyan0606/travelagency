import Skeleton from 'react-loading-skeleton';

const PackageCardSkeleton = () => {
    return (
        <div className="flex flex-col w-full h-full bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
            {/* Image Placeholder */}
            <div className="w-full h-[220px] sm:h-[240px] flex-shrink-0">
                <Skeleton height="100%" containerClassName="h-full block" style={{ borderRadius: 0, height: '100%' }} />
            </div>

            {/* Content Placeholder */}
            <div className="flex flex-col flex-1 p-5 gap-4">
                {/* Title & Location Placeholder */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2 w-full">
                        <Skeleton height={20} width="80%" />
                        <Skeleton height={16} width="50%" />
                    </div>
                    <div className="w-8 flex-shrink-0">
                        <Skeleton circle height={32} width={32} />
                    </div>
                </div>

                {/* Badges row Placeholder */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <Skeleton height={24} width={100} borderRadius={6} />
                    <Skeleton height={24} width={60} borderRadius={6} />
                </div>

                {/* Footer Placeholder (pricing & buttons) */}
                <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-gray-100">
                    {/* Pricing */}
                    <div className="flex items-center gap-2">
                        <Skeleton height={14} width={40} />
                        <Skeleton height={16} width={60} />
                        <Skeleton height={24} width={80} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-stretch gap-2 w-full mt-1">
                        <Skeleton height={40} width={40} borderRadius={8} />
                        <Skeleton height={40} width="100%" borderRadius={8} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageCardSkeleton;
