import Skeleton from 'react-loading-skeleton';

const PackageCardSkeleton = () => {
    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto p-2 sm:p-5">
            <div className="relative flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-xl w-full">

                {/* Image Placeholder */}
                <div className="w-full sm:w-[55%] h-[300px] md:h-auto">
                    <Skeleton height="100%" containerClassName="h-full block" style={{ borderRadius: 0, height: '100%' }} />
                </div>

                {/* Content Placeholder */}
                <div className="flex flex-col justify-center gap-6 p-8 md:w-[45%] w-full">

                    {/* Location & Heart */}
                    <div className="flex justify-between items-center">
                        <div className="w-32">
                            <Skeleton height={24} />
                        </div>
                        <div className="w-8">
                            <Skeleton circle height={32} width={32} />
                        </div>
                    </div>

                    {/* Details (Days, Rating) */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6">
                                <Skeleton height={24} width={24} />
                            </div>
                            <div className="w-24">
                                <Skeleton height={16} />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6">
                                <Skeleton height={24} width={24} />
                            </div>
                            <div className="w-20">
                                <Skeleton height={16} />
                            </div>
                        </div>
                    </div>

                    {/* Price & Contact */}
                    <div className="mt-2 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="w-12">
                                <Skeleton height={16} />
                            </div>
                            <div className="w-28">
                                <Skeleton height={24} />
                            </div>
                        </div>

                        <div className="w-full h-[2px] ">
                            <Skeleton height={2} />
                        </div>

                        <div className="flex justify-between items-center gap-4">
                            <div className="w-10">
                                <Skeleton height={40} width={40} />
                            </div>
                            <div className="w-full">
                                <Skeleton height={40} borderRadius={8} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageCardSkeleton;
